import requests
import pyttsx3
import base64
import os
import speech_recognition as sr
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
import socketio

# ------------------ 🔐 API and Firebase Init ------------------
genai.configure(api_key="AIzaSyB2TvHIt8HsoiKuURmb7jme5IvF1JbBXF8")  # Replace with your actual Gemini API key
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ------------------ 🌐 Socket.IO Setup ------------------
sio = socketio.Client()

@sio.event
def connect():
    print("✅ Connected to Socket.IO server")

@sio.event
def disconnect():
    print("❌ Disconnected from Socket.IO server")

# Connect to your Render server here
if not sio.connected:
    sio.connect("https://fateh-2.onrender.com", transports=[ "websocket"])

#sio.emit("robot_wakeup", {"status": "manual test"})


# ------------------ 🎙 Voice Setup ------------------
def setup_voice():
    engine = pyttsx3.init()
    engine.setProperty('rate', 130)
    voices = engine.getProperty('voices')
    for voice in voices:
        if "en-in" in voice.id.lower():
            engine.setProperty('voice', voice.id)
            break
    return engine

engine = setup_voice()

def speak(text):
    print("🤖 Assistant:", text)
    
    # Send assistant's reply to the robot over WebSocket
    sio.emit("assistant_reply", {"reply": text})
    
    engine.say(text)
    engine.runAndWait()



# ------------------ 🎤 Listen with Live Caption ------------------
def listen_and_caption():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎤 Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        full_text = recognizer.recognize_google(audio).lower()
        print("🗣 You said:", full_text)

        # 👇 This part is removed to stop sending user words
        # for word in full_text.split():
        #     sio.emit("caption", {"word": word})
        
        return full_text

    except sr.UnknownValueError:        
        speak("I didn't catch that.")
        return ""
    except sr.RequestError:
        speak("Speech recognition error.")
        return ""


# ------------------ 🔥 Firestore Data Fetch ------------------
def get_equipment_data():
    docs = db.collection("equipment").stream()
    return [doc.to_dict() for doc in docs]

def get_officials_data():
    docs = db.collection("officials").stream()
    return [doc.to_dict() for doc in docs]

# ------------------ 📷 Send Images to Gemini ------------------
def encode_image_to_base64(image_path):
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
            return "data:image/jpeg;base64," + encoded_string
    except Exception as e:
        print(f"Error encoding {image_path}: {e}")
        return None

def send_images_to_gemini(image_folder="earthquake"):
    url = "http://localhost:5000/analyze_frame"
    headers = {"Content-Type": "application/json"}
    images_base64 = []

    for filename in os.listdir(image_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.avif')):
            path = os.path.join(image_folder, filename)
            encoded = encode_image_to_base64(path)
            if encoded:
                images_base64.append(encoded)

    if not images_base64:
        speak("No images found.")
        return

    data = {"images": images_base64}
    try:
        response = requests.post(url, json=data, headers=headers)
        result = response.json().get("response", "No response.")
        speak(result)
    except:
        speak("Error sending images to Gemini.")

# ------------------ 🧠 Contextual Gemini Answer ------------------
def ask_gemini_with_context(query):
    equipment_data = get_equipment_data()
    officials_data = get_officials_data()

    if any(k in query for k in ["equipment", "kit", "item", "available", "status"]):
        prompt = (
            f"You are an assistant for NDRF. Based on this equipment data, answer the question:\n\n"
            f"{equipment_data}\n\nQuestion: {query}\nRespond in one line."
        )
    elif any(k in query for k in ["officer", "official", "designation", "zone", "director", "inspector"]):
        prompt = (
            f"You are an assistant for NDRF. Based on this officials data, answer the question:\n\n"
            f"{officials_data}\n\nQuestion: {query}\nRespond in one line."
        )
    else:
        prompt = (
            f"You are an AI assistant for NDRF. Officials: {officials_data}\n"
            f"Equipment: {equipment_data}\nQuestion: {query}\nRespond in one line."
        )

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        speak(response.text)
    except Exception as e:
        speak("Error processing your request.")
        print("Gemini Error:", e)

# ------------------ 💻 Website Voice Control ------------------
def handle_website_commands(command):
    if "show drone stream" in command:
        sio.emit("control", {"action": "fullscreen_drone"})
        return True
    elif "show robot replies" in command:
        sio.emit("control", {"action": "fullscreen_caption"})
        return True
    elif "show home page" in command:
        sio.emit("control", {"action": "fullscreen_home"})
        return True

    actions = {
        "full screen": "fullscreen",
        "minimize screen": "minimize",
        "toggle infrared": "toggle_infrared",
        "pause stream": "pause",
        "resume stream": "resume"
    }

    for cmd, action in actions.items():
        if cmd in command:
            sio.emit("control", {"action": action})
            speak(f"{action.capitalize()} executed.")
            return True
    return False


# ------------------ 🔁 Main Loop ------------------
def main_loop():
    speak("Ffauteh bot activated. Say 'hello' to begin.")

    while True:
        command = listen_and_caption()
        if not command:
            continue

        if "hello" in command: # 🟢 Trigger open eyes on web
            sio.emit("robot_wakeup", {"status": "awake"})

            speak("Hello! I am Ffauteh from NDRF. How can I help you?")
            

            while True:
                command = listen_and_caption()
                if not command:
                    continue

                if "stop" in command or "exit" in command:
                    speak("Goodbye!")
                    return
                elif "analyse images" in command or "send images" in command:
                    send_images_to_gemini()
                elif handle_website_commands(command):
                    continue
                else:
                    ask_gemini_with_context(command)

# -------------------- 🚀 Start ------------------
if _name_ == "_main_":
    main_loop()
