#include <Servo.h>
#include <SPI.h>
#include <Ethernet.h>
int valor = 0;
// Utilize o endereço MAC que está na etiqueta branca da
// sua Galielo
byte mac[] = { 0x98, 0x4f, 0xee, 0x01, 0xee, 0x80 };

// IP do servidor e porta do servidor.
//IPAddress server(192,168,1,32);
char server[] = "0.tcp.ngrok.io";
int port = 18022;

EthernetClient client;
String line = "";

// Marcadores da string line
int lendo_valor = false;

Servo one;  //Vertical servo
Servo two;  // Horisontal servo

//int pos = 0;    //store servo possition.

int tempo = 0;  //time variable, Store last time.

// Variaveis para delay de envio de informacoes
const long interval = 100;
unsigned long previousMillis = 0;

void setup()
{
  pinMode(13, OUTPUT);
  one.attach(9); //attach servos
  two.attach(11);
  //conexão com o servidor
  
  Serial.begin(9600);
  system("ifup eth0");
  Serial.println("Tentando obter um IP:");
  while (!Ethernet.begin(mac)) {
    Serial.println("Erro ao conectar");
  }
  Serial.print("Meu endereco:");
  Serial.println(Ethernet.localIP());

  // Reserva espaço para a string
  line.reserve(10);
  
}

void loop()
{
  if (client.connected()) {
    if (client.available()) {
      char c = client.read();
      line += c;
      if (c == '\n')
        line = "";


      if (line.endsWith("{")) {
        lendo_valor = true;
        line = "";
      }

      if (lendo_valor) {
        if (c == '}') {
          valor = line.toInt();
          lendo_valor = false; 
          Serial.print("Recebendo: ");
          Serial.println(valor); 
        }
      }
      
  //começo braço robo laser
 
  //fim braço robo
    }
  } else {
    Serial.println("Conectando ao servidor");
    delay(100);
    client.connect(server, port);
  }
    if(valor == 1) {
      //randomSeed(analogRead(0));
      int repeticoes = random(2,5);
      for(int i=0; i < repeticoes; i++){
        digitalWrite(13, HIGH); // LASER

        tempo = random(1, 500); //time is random between 1 and 1000 ms
        //randomSeed(analogRead(0));
        int oneStart = random(90, 180); //random degree for vertical servo
        delay(tempo);
          
        int twoStart = random(100, 180); //random degree for horisontal servo
        delay(tempo);
          
        one.write(oneStart);
        two.write(twoStart);
      }
        }else{
           digitalWrite(13, LOW);
        }  
  //envia dados
  /*
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    if (client.connected()) {
      int value = client.read();
      client.println(value);
      Serial.print("Enviando: ");
      Serial.println(value);
      
    }
  }

*/
}
