#include <LiquidCrystal.h>
#include <Servo.h>
#include <Keypad.h>

Servo myservo;
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte rowPins[ROWS] = {A0, A1, A2, A3};
byte colPins[COLS] = {A4, A5, 1, 0};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
LiquidCrystal lcd(8, 7, 5, 4, 3, 2);
int password;
const int timer = 5000;
const int pass = 123;
String text = "";
int ctr = 1;
const int clearButtonPin = 12; // Pin for the clear button

int rgb(int red, int green, int blue) {
  analogWrite(11, red);
  analogWrite(9, green);
  analogWrite(10, blue);
}

void setup() {
  pinMode(11, OUTPUT); // RED
  pinMode(10, OUTPUT); // BLUE
  pinMode(9, OUTPUT); // GREEN
  pinMode(clearButtonPin, INPUT_PULLUP); // Setup clear button with internal pull-up resistor
  lcd.begin(16, 2);
  myservo.attach(6);
  lcd.print("Enter Password:");
  lcd.blink();
  lcd.setCursor(0, 1);
}

void loop() {
  char key = keypad.getKey();
  myservo.write(0);

  if (ctr == 1) {
    rgb(255, 255, 50); // YELLOW
  }

  if (key != NO_KEY) {
    ctr += 1;
    if (key <= '9' && key >= '0' && ctr != 1) {
      rgb(255, 192, 203); // PINK
      text = text + key;
      lcd.print("*");
      delay(500);
      ctr = 1;
    }

    if (key == 'A') {
      password = text.toInt();
      if (password == pass) {
        lcd.clear();
        lcd.noBlink();
        lcd.print("Access Granted");
        lcd.setCursor(0, 1);
        lcd.print("Door is UNLOCKED");
        myservo.write(90);
        rgb(0, 255, 0);
        delay(timer);
        lcd.clear();
        lcd.print("Enter Password:");
        lcd.blink();
        lcd.setCursor(0, 1);
        text = "";
        password = 0;
        ctr = 1;
      } else {
        lcd.clear();
        lcd.noBlink();
        lcd.print("Password Wrong");
        lcd.setCursor(0, 1);
        lcd.print("Access Denied");
        myservo.write(0);
        rgb(255, 0, 0);
        delay(timer);
        lcd.clear();
        lcd.print("Enter Password:");
        lcd.blink();
        lcd.setCursor(0, 1);
        text = "";
        password = 0;
        ctr = 1;
      }
    }

    // Remove the '*' condition for clear as it's now handled by the button
    // if (key == '*') {
    //   lcd.clear();
    //   lcd.print("Enter Password:");
    //   lcd.blink();
    //   lcd.setCursor(0, 1);
    //   text = "";
    //   password = 0;
    //   ctr = 1;
    // }
  }

  // Check if the clear button is pressed
  if (digitalRead(clearButtonPin) == LOW) {
    lcd.clear();
    lcd.print("Enter Password:");
    lcd.blink();
    lcd.setCursor(0, 1);
    text = "";
    password = 0;
    ctr = 1;
    delay(500); // Debounce delay
  }
}
