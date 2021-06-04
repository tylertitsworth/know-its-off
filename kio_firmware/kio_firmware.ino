/* Includes */
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h> 
#include <LittleFS.h>
#include <WiFiClient.h>
#include <ESP8266mDNS.h>
#include <SPI.h>

/* Defines */
#define DEBUG_EN  // Enables serial communication 
#define SECURE_EN  // Enables host verification with X509 .cer file

/* WiFi Variables */
String router_ssid = "";  // router ssid for normal operation
String router_password = "";  // router password for normal operation

/* HTTPS Variables */
String host = "";  // url or address of the database handler
String trustRoot = "";  // temporarily holds certification file for host verification
WiFiClientSecure httpsClient;  // client object to connect to database handler

/* Device variables */
int digi_pot = 0;  // holds the value that the digital potentiometer is set to
String device_id = ""; // holds the unique device ID number
bool eof = true;  // indicates to the onUpload function when to stop appending data to trust_root.txt
int battery_voltage = 0;  // 10-bit battery value
int device_state = 0;  // 1 bit device state

/* Device pinout Constants */
const int adcPin = A0;  // Analog read pin (0-1.0v, 10-bit)
const int statePin = 4;  // Determins the current state of appliance light
const int modePin = 5;  //  Digital input, determines config or normal operation mode 
const int csPin = 15;  // Chip select pin for MCP41010

/* Local Access Point Variables */
AsyncWebServer server(80);  // webserver object that listens for requests on port 80
const char* local_ssid = "KIOSetup";  // ssid of device in AP mode
const char* local_password = "letsgoducks";  // password of device in AP mode (8+ characters required)
IPAddress local_ip(192,168,1,1);  
IPAddress gateway(192,168,1,1);  // ip address objects for access point configuration
IPAddress subnet(255,255,255,0);

/* Initialization and mode select */
void setup() {

  // Initialize serial connection for debug
  #ifdef DEBUG_EN
  Serial.begin(115200);
  Serial.println("");
  Serial.println("");
  #endif
  
  // Mount LittleFS filesystem, load in local variables, begin SPI
  LittleFS.begin();
  loadVariables();

  // Small delay to allow for depressing gpio0 on a development board for debug
  #ifdef DEBUG_EN
  delay(5000);  
  #endif

  // Check if device should launch in config mode
  //pinMode(modePin, INPUT);
  int operationMode = digitalRead(modePin);
  if(operationMode==0){
    config_mode();
  }
  else if(operationMode==1){
    normal_mode();
  }
}

/* Nothing needs to be run in the loop as normal mode sends esp to sleep and config is asynchronous */
void loop() {
}

/* Uses the device as a local accesspoint that can be configured at 192.168.1.1 on KIOSetup */
void config_mode(){
  #ifdef DEBUG_EN
  Serial.println("Starting in config mode");
  #endif 
  WiFi.softAPConfig(local_ip, gateway, subnet);  // load access point configuration
  WiFi.softAP(local_ssid, local_password, 1, false, 4);  // launches local accesspoint *note password MUST be 8+ characters long or this function will fail*

  // Handle root request, send index.html that contains links to all other required files to display the landing page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    #ifdef DEBUG_EN
    Serial.println("Request for root");
    #endif
    request->send(LittleFS, "index.html", String(), false, processor);
  });

  // Handle request for bootstrap css file
  server.on("/bootstrap.min.css", HTTP_GET, [](AsyncWebServerRequest *request){
    #ifdef DEBUG_EN
    Serial.println("Request for bootstrap.min.css");
    #endif
    request->send(LittleFS, "bootstrap.min.css", "text/css");  // Sends bootstrap.min.css file in text/css format
  });

  // Handle request for boostrap javascript file 
  server.on("/bootstrap.min.js", HTTP_GET, [](AsyncWebServerRequest *request){
    #ifdef DEBUG_EN
    Serial.println("Request for bootstrap.min.js");
    #endif
    request->send(LittleFS, "bootstrap.min.js", "text/javascript");  // Sends bootstrap.min.js file in text/javascript format
  });

  server.on("/beavs.ico", HTTP_GET, [](AsyncWebServerRequest *request){
    #ifdef DEBUG_EN
    Serial.println("Request for beavs.ico");
    #endif
    request->send(LittleFS, "beavs.ico", "image/x-icon");  // Sends beavs.ico file in image/x-icon format
  }); 
  
  // Handle request for certification file upload
  server.on("/upload", HTTP_POST, [](AsyncWebServerRequest *request){
    request->redirect("/");  // redirect to root
  }, onUpload);  // Runs onUpload processor on the received request
  
  // Handle request for certification file
  server.on("/trust_root.txt", HTTP_GET, [](AsyncWebServerRequest *request){
    #ifdef DEBUG_EN
    Serial.println("Request for trust_root.txt");
    #endif
    request->send(LittleFS, "trust_root.txt", "text/plain", false);  // Sends trust_root.txt in plaintext form, specifies not to download
  });

  /* Handle variable update requests for host, router_ssid, router_password
   * note: by the HTTP request convetion, submitting form data is typically 
   * implemented with a POST request instead of a GET request but this 
   * method provides easier access to the data I need through headers       */
  server.on("/get", HTTP_GET, [](AsyncWebServerRequest *request){
    int params = request->params();
    for(int i=0;i<params;i++){
      AsyncWebParameter* p = request->getParam(i);
      #ifdef DEBUG_EN
      Serial.println("Request update for " + p->name() + " to: " + p->value());
      #endif
      if(p->name() == "routerSSID"){
        router_ssid=p->value();
      }
      else if(p->name() == "routerPASS"){
        router_password=p->value();
      }
      else if(p->name() == "hostID"){
        host=p->value();
      }
    }
    updateFiles();  // Update files to reflect new variable values
    request->redirect("/");  // redirect to root
  });

  // Handle request for calibrate funciton
  server.on("/calibrate", HTTP_GET, [](AsyncWebServerRequest *request){
    request->redirect("/");
    calibratePot();
  });

  // Handle request for reset
  server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200);  // Send OK response to client
    espSleep();  // Shut down ESP
  });

  // Handle invalid request
  server.onNotFound([](AsyncWebServerRequest *request){
    #ifdef DEBUG_EN
    Serial.println("Invalid Request");
    #endif
    request->send(404);  // Reply with not found
  });

  // Start server
  server.begin();
  #ifdef DEBUG_EN
  Serial.println("Launched Webserver");
  #endif
}

/* Normal operating mode that updates host with device state changes */
void normal_mode(){
  #ifdef DEBUG_EN
  Serial.println("Starting in normal mode");
  #endif
  trustRoot = readFile("trust_root.txt");  // Load the certification file into a temporary string
  X509List cert(trustRoot.c_str());  // Generate the trust list from the certification file

  pinMode(adcPin, INPUT);
  pinMode(statePin, INPUT);
  battery_voltage = analogRead(adcPin);  
  device_state = digitalRead(statePin);
  #ifdef DEBUG_EN
  Serial.println("Read battery voltage as: " + (String)battery_voltage + "\nRead device state as: " + (String)device_state);
  #endif

  // Initate wifi connection to specified router/pass
  #ifdef DEBUG_EN
  Serial.print("Initating connection to " + router_ssid + " ");
  #endif 
  int r=0; //retry counter
  WiFi.begin(router_ssid, router_password);
  while((WiFi.status() != WL_CONNECTED) && (r < 30)){
    r++;
    delay(1000);
    #ifdef DEBUG_EN
    Serial.print(".");
    #endif
  }
  if(r==30){
    #ifdef DEBUG_EN
    Serial.println("");
    Serial.println("Connection failed, initiating sleep");
    #endif
    espSleep();
  }
  #ifdef DEBUG_EN
  Serial.println("");
  Serial.print("Connected to " + router_ssid + " @");
  Serial.println(WiFi.localIP());
  #endif
  
  #ifdef SECURE_EN
  configTime(3 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  #ifdef DEBUG_EN
  Serial.print("Waiting for NTP time sync: ");
  #endif
  time_t now = time(nullptr);  // Create a time object
  while (now < 8 * 3600 * 2) {  // Sync local time
    delay(1000);
    #ifdef DEBUG_EN
    Serial.print(".");
    #endif
    now = time(nullptr);
  }
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);  // Sync time to gmt over tcp

  #ifdef DEBUG_EN
  Serial.println("");
  Serial.print("Current time: ");
  Serial.println(asctime(&timeinfo));
  Serial.println("Setting trust anchors");
  #endif
  httpsClient.setTrustAnchors(&cert);  // Trust anchors can only be set after time is syncd
  #else
  #ifdef DEBUG_EN
  Serial.println("Skipping setting trust anchors");
  #endif
  httpsClient.setInsecure();  // This prevents host verification! Not reccomended unless testing
  #endif

  #ifdef DEBUG_EN
  Serial.print("HTTPS Connecting to " + host);
  #endif
  r=0;
  while((!httpsClient.connect(host, 443)) && (r < 30)){ //
    delay(1000);
    r++;
    #ifdef DEBUG_EN
    Serial.print(".");
    #endif
  }
  if(r==30) {
    #ifdef DEBUG_EN
    Serial.println("");
    Serial.println("Connection failed");
    #endif
    espSleep();
  }
  else {
    #ifdef DEBUG_EN
    Serial.println("");
    Serial.println("Connected to host");
    #endif
  }
  String request = generatePATCH(host, device_id, device_state, battery_voltage);
  httpsClient.print(request);
  #ifdef DEBUG_EN
  Serial.println("Request sent:");
  Serial.println(request);
  #endif

  #ifdef DEBUG_EN
  Serial.println("HTTPS Reply:");
  String line;
  while(httpsClient.available()){        
    line = httpsClient.readStringUntil('\n');  //Read Line by Line
    Serial.println(line); //Print response
  }
  #endif
  espSleep();
}

/* Sends the microcontroller into indefinite deep sleep */
void espSleep(){
  #ifdef DEBUG_EN
  Serial.println("Client requested shutdown");
  Serial.println("Entering sleep mode");
  #endif
  ESP.deepSleep(0);
}

/* Loads variables from files */
void loadVariables(){
  #ifdef DEBUG_EN
  Serial.println("Loading variables from files and finding device ID");
  #endif
  device_id = (String)findID();
  digi_pot = atoi(readFile("digi_pot.txt").c_str());
  host = readFile("host.txt");
  router_password = readFile("router_password.txt");
  router_ssid = readFile("router_ssid.txt");
}

/* Updates all files */
void updateFiles(){
  #ifdef DEBUG_EN
  Serial.println("Updating all files from variables");
  #endif
  writeFile("digi_pot.txt", (String)digi_pot);
  writeFile("host.txt", host);
  writeFile("router_password.txt", router_password);
  writeFile("router_ssid.txt", router_ssid);
}

/* Reads data from a specified file */
String readFile(String filepath){
  #ifdef DEBUG_EN
  Serial.println("Reading file: " + filepath);
  #endif
  File file = LittleFS.open(filepath, "r");
  String contents;
  while(file.available()){
    contents+=char(file.read());
  }
  file.close();
  #ifdef DEBUG_EN
  Serial.println("String read from " + filepath + ": " + contents);
  #endif
  return contents; 
}

/* Writes data to a specified file */
void writeFile(String filepath, String message){
  File file = LittleFS.open(filepath, "w");
  if(file.print(message.c_str())){
    #ifdef DEBUG_EN
    Serial.println("Wrote " + filepath + " with: " + message);
    #endif
  }
  else{  
    #ifdef DEBUG_EN
    Serial.println("Write to " + filepath + " failed");
    #endif
  }
  file.close();
}

/* Handle upload requests for trust_root.txt */
void onUpload(AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final){
  /* Note: these requests are received in chunks, and often files will 
   * require more than one pass to upload completely. This is due to a
   * buffer limitation somewhere, but I am too lazy to find it.        */
  if(eof){  // On first pass through this function
    #ifdef DEBUG_EN
    Serial.println("Upload Request: trust_root.txt");
    #endif
    writeFile("trust_root.txt", "");  // Clear the current contents of the file
    eof = false;  // toggle the end of file variable so that we know not to clear the file again
  }
  File file = LittleFS.open("trust_root.txt", "a");  // open trust_root.txt in append mode
  for(size_t i=0; i<len; i++){  // write data to file
    file.write(data[i]);
  }
  /* the variable final specifies the connection from the client has
   * been closed which implies that the entire file has been recieved    */
  if(final){
    #ifdef DEBUG_EN
    Serial.printf("UploadEnd: %s, %u B\n", filename.c_str(), index+len);
    #endif
    eof = true;  // toggle back end of file variable so that next time onUpload is called, we know to erase the existing contents of trust_root.cer
  }
  file.close();  // Close trust_root.txt
}

/* Handles filling placeholder variables on the index.html webpage */
String processor(const String&var){
  #ifdef DEBUG_EN
  Serial.print("Proccessor called for " + var + ", replacing with \"");
  #endif
  String returnval;  // Initialize a value to hold the data to be sent
  if(var=="ROUTERSSID"){
    returnval = router_ssid;  // return the value stored in router_ssid
  }
  else if(var=="HOSTNAME"){
    returnval = host;  // return the value stored in host
  }
  else if(var=="ROUTERPASSWORD"){
    returnval = router_password;  // return the value stored in router_password
  }
  else if(var=="ID"){
    returnval = device_id;  // return the value stored in device_id
  }
  #ifdef DEBUG_EN
  Serial.println(returnval + "\"");
  #endif
  return returnval;
}

/* Creates an HTTPS patch request for specified device id, with specified device state and device battery variables in .json format */
String generatePATCH(String host, String deviceID, int deviceState, int deviceBattery){
  String body = "{\r\n";  // Create body of post request in json format
  body += "\"device_state\": " + String(deviceState) + "," + "\r\n";
  body += "\"device_battery\": " + String(deviceBattery) + "\r\n";
  body += "}";
  String post = (String)"PATCH " + "https://" + host + "/api/updateState" + "/" + device_id + " HTTP/1.1\r\n";  // Create headers, append previously generated body, append connection close
  post += "Host: " + host + "\r\n";
  post += "Content-Type: application/json\r\n";
  post += "Content-Length: " + String(body.length()) + "\r\n\r\n";
  post += body + "\r\n";
  post += "Connection: keep-alive\r\n\r\n";
  return post;  // return result
}

/* Derives Device ID number from last 4 of MAC address */
int findID (){
  uint8_t mac[6];  // create temporary variable to store whole mac
  int returnval = 0;  // create empty summation value
  WiFi.macAddress(mac);  // retreive mac into temporary variable
  returnval = mac[6] + (256*mac[5]);  // Sum the last 4 bytes of the mac address
  return returnval;  // return summation
}

/* Writes an 8-bit value to pot 0 of the MCP41010 */
void writePot(byte input){
  #ifdef DEBUG_EN
  Serial.println("Sending MCP41010 new value of: " + (String)input);
  #endif
  pinMode(csPin, OUTPUT);
  digitalWrite(csPin, HIGH);  // CS pin is default pulled low, need to set it high so that it can be brought low again to initiate a command
  SPI.begin();
  digitalWrite(csPin, LOW);
  SPI.transfer(0x11);
  SPI.transfer(input);
  digitalWrite(csPin, HIGH);
  SPI.end();
}

/* Calibrates digipot value for light source 
   This function is intended to cause a reset when it finds the correct resistance value
   Because of the NPN, this function should almost never return, even at ~100, the circuit
   is extremely sensitive to light change
*/ 
int calibratePot(){
  for(byte i = 0; i < 255; i++){
    writeFile("digi_pot.txt", (String)i);
    writePot(i);
    delay(40);  // settling time of photoresistor
  }
  return 1;  // only returns if device does not successfully calibrate
}
