import tkinter as tk
from tkinter import PhotoImage, messagebox
import re
import psutil
import GPUtil
from cpuinfo import get_cpu_info
import json
from difflib import SequenceMatcher
from pymongo import MongoClient
from cryptography.fernet import Fernet
import base64
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# MongoDB connection
client = MongoClient("mongodb+srv://luisospinor:73562772@cluster0.fjz2q.mongodb.net/specsGamingDB?retryWrites=true&w=majority")
db = client.specsGamingDB
collection = db.usuarios

# Load processors and graphics from JSON
with open("./public/data/procesadores.json", "r") as f:
    processors = json.load(f)

with open("./public/data/graficas.json", "r") as f:
    graphics = json.load(f)

# Encryption setup
def get_key(password, salt=None):
    if salt is None:
        salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key, salt

def encrypt_data(data, key):
    f = Fernet(key)
    return f.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data, key):
    f = Fernet(key)
    return f.decrypt(encrypted_data.encode()).decode()

# Use a secret key for encryption (in a real application, store this securely)
SECRET_KEY = "your_secret_key_here"
ENCRYPTION_KEY, SALT = get_key(SECRET_KEY)

def find_closest_match(name, data):
    best_match = None
    highest_similarity = 0
    for item in data:
        similarity = SequenceMatcher(None, name.lower(), item["name"].lower()).ratio()
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = item["name"]
    return best_match if best_match else name

def get_system_info():
    cpu_info = get_cpu_info()
    cpu_name = cpu_info['brand_raw']
    ram = round(psutil.virtual_memory().total / (1024**3))
    try:
        gpus = GPUtil.getGPUs()
        gpu = gpus[0].name if gpus else "Integrated Graphics"
    except:
        gpu = "Integrated Graphics"
    return find_closest_match(cpu_name, processors), ram, find_closest_match(gpu, graphics)

class SpecsGamingApp:
    def __init__(self, master):
        self.master = master
        self.master.title("SpecsGaming")
        self.master.geometry("1024x576")
        self.master.config(bg="#1e1e2f")
        self.master.overrideredirect(True)  # Remove default window decorations
        self.master.resizable(False, False)  # Disable resizing
        self.center_window()
        self.create_title_bar()
        self.content_frame = tk.Frame(self.master, bg="#1e1e2f")
        self.content_frame.pack(expand=True, fill=tk.BOTH)
        self.show_main_screen()

    def center_window(self):
        screen_width = self.master.winfo_screenwidth()
        screen_height = self.master.winfo_screenheight()
        x = (screen_width - 1024) // 2
        y = (screen_height - 576) // 2
        self.master.geometry(f"1024x576+{x}+{y}")

    def create_title_bar(self):
        title_bar = tk.Frame(self.master, bg="#2c2c3e", relief="raised", bd=0, height=30)
        title_bar.pack(expand=0, fill=tk.X)
        title_bar.bind("<ButtonPress-1>", self.start_move)
        title_bar.bind("<ButtonRelease-1>", self.stop_move)
        title_bar.bind("<B1-Motion>", self.do_move)

        close_button = tk.Button(title_bar, text="X", command=self.master.quit, bg="#ff5f56", fg="white", font=("Arial", 10, "bold"), bd=0, padx=7, pady=3)
        close_button.pack(side=tk.RIGHT, padx=4, pady=3)

        minimize_button = tk.Button(title_bar, text="_", command=self.master.iconify, bg="#ffbd2e", fg="white", font=("Arial", 10, "bold"), bd=0, padx=7, pady=3)
        minimize_button.pack(side=tk.RIGHT, padx=4, pady=3)

        title_label = tk.Label(title_bar, text="SpecsGaming", bg="#2c2c3e", fg="white", font=("Arial", 10))
        title_label.pack(side=tk.LEFT, padx=10)

    def start_move(self, event):
        self.x = event.x
        self.y = event.y

    def stop_move(self, event):
        self.x = None
        self.y = None

    def do_move(self, event):
        deltax = event.x - self.x
        deltay = event.y - self.y
        x = self.master.winfo_x() + deltax
        y = self.master.winfo_y() + deltay
        self.master.geometry(f"+{x}+{y}")

    def show_main_screen(self):
        self.clear_window()
        
        # Logo
        self.logo_img = PhotoImage(file="logo.png")
        logo_label = tk.Label(self.content_frame, image=self.logo_img, bg="#1e1e2f")
        logo_label.pack(pady=(10, 0))

        # Main title
        title = tk.Label(self.content_frame, text="Welcome to SpecsGaming", font=("Arial", 30, "bold"), fg="#38bdf8", bg="#1e1e2f")
        title.pack(pady=(50, 20))

        # Subtitle
        subtitle = tk.Label(self.content_frame, text="The ideal game for your PC", font=("Arial", 16), fg="#94a3b8", bg="#1e1e2f")
        subtitle.pack(pady=(0, 30))

        # Register button
        button_register = tk.Button(self.content_frame, text="Register", font=("Arial", 14, "bold"), bg="#4caf50", fg="white",
                                    activebackground="#388e3c", activeforeground="white", command=self.show_register_screen, width=12)
        button_register.pack(pady=10)

        # Login button
        button_login = tk.Button(self.content_frame, text="Login", font=("Arial", 14, "bold"), bg="#6200ea", fg="white",
                                 activebackground="#3700b3", activeforeground="white", command=self.show_login_screen, width=12)
        button_login.pack(pady=10)

    def show_register_screen(self):
        self.clear_window()

        # Title
        title = tk.Label(self.content_frame, text="Register", font=("Arial", 30, "bold"), fg="#38bdf8", bg="#1e1e2f")
        title.pack(pady=(50, 20))

        # Form fields
        self.email_entry = self.create_form_field("Email:")
        self.name_entry = self.create_form_field("Name:")
        self.password_entry = self.create_form_field("Password:", show="*")
        self.confirm_password_entry = self.create_form_field("Confirm Password:", show="*")

        # Submit button
        send_button = tk.Button(self.content_frame, text="Submit", font=("Arial", 14, "bold"), bg="#4caf50", fg="white",
                                activebackground="#388e3c", activeforeground="white", command=self.register, width=12)
        send_button.pack(pady=(20, 10))

        # Back button
        back_button = tk.Button(self.content_frame, text="Back", font=("Arial", 14, "bold"), bg="#6200ea", fg="white",
                                activebackground="#3700b3", activeforeground="white", command=self.show_main_screen, width=12)
        back_button.pack(pady=(10, 20))

    def show_login_screen(self):
        self.clear_window()

        # Title
        title = tk.Label(self.content_frame, text="Login", font=("Arial", 30, "bold"), fg="#38bdf8", bg="#1e1e2f")
        title.pack(pady=(50, 20))

        # Form fields
        self.login_email_entry = self.create_form_field("Email:")
        self.login_password_entry = self.create_form_field("Password:", show="*")

        # Login button
        login_button = tk.Button(self.content_frame, text="Login", font=("Arial", 14, "bold"), bg="#4caf50", fg="white",
                                 activebackground="#388e3c", activeforeground="white", command=self.login, width=12)
        login_button.pack(pady=(20, 10))

        # Back button
        back_button = tk.Button(self.content_frame, text="Back", font=("Arial", 14, "bold"), bg="#6200ea", fg="white",
                                activebackground="#3700b3", activeforeground="white", command=self.show_main_screen, width=12)
        back_button.pack(pady=(10, 20))

    def create_form_field(self, label_text, show=None):
        frame = tk.Frame(self.content_frame, bg="#1e1e2f")
        frame.pack(pady=5)
        
        label = tk.Label(frame, text=label_text, font=("Arial", 14), fg="#94a3b8", bg="#1e1e2f")
        label.pack(side=tk.LEFT, padx=(0, 10))

        entry = tk.Entry(frame, font=("Arial", 14), show=show)
        entry.pack(side=tk.LEFT)
        
        return entry

    def register(self):
        email = self.email_entry.get()
        name = self.name_entry.get()
        password = self.password_entry.get()
        confirm_password = self.confirm_password_entry.get()

        if not self.validate_email(email):
            messagebox.showerror("Error", "Invalid email format")
            return

        if not self.validate_password(password):
            messagebox.showerror("Error", "Password must be at least 8 characters long and contain uppercase, lowercase, digit, and special character")
            return

        if password != confirm_password:
            messagebox.showerror("Error", "Passwords do not match")
            return

        if collection.find_one({"email": email}):
            messagebox.showerror("Error", "This email is already registered")
            return

        cpu, ram, gpu = get_system_info()
        
        encrypted_password = encrypt_data(password, ENCRYPTION_KEY)
        
        user_data = {
            "email": email,
            "name": name,
            "password": encrypted_password,
            "hardware": {
                "processor": encrypt_data(cpu, ENCRYPTION_KEY),
                "ram": encrypt_data(str(ram), ENCRYPTION_KEY),
                "graphics": encrypt_data(gpu, ENCRYPTION_KEY)
            },
            "selectedGames": []
        }
        
        collection.insert_one(user_data)
        messagebox.showinfo("Success", "Registration successful!")
        self.show_profile_screen(user_data)

    def login(self):
        email = self.login_email_entry.get()
        password = self.login_password_entry.get()

        user = collection.find_one({"email": email})
        if not user:
            messagebox.showerror("Error", "User not found")
            return

        decrypted_password = decrypt_data(user['password'], ENCRYPTION_KEY)
        if password != decrypted_password:
            messagebox.showerror("Error", "Incorrect password")
            return

        # Update hardware information
        cpu, ram, gpu = get_system_info()
        updated_hardware = {
            "processor": encrypt_data(cpu, ENCRYPTION_KEY),
            "ram": encrypt_data(str(ram), ENCRYPTION_KEY),
            "graphics": encrypt_data(gpu, ENCRYPTION_KEY)
        }
        
        collection.update_one({"email": email}, {"$set": {"hardware": updated_hardware}})
        
        user['hardware'] = updated_hardware
        self.show_profile_screen(user)

    def show_profile_screen(self, user_data):
        self.clear_window()

        # Profile title
        title = tk.Label(self.content_frame, text="User Profile", font=("Arial", 30, "bold"), fg="#4caf50", bg="#1e1e2f")
        title.pack(pady=(50, 20))

        # User info
        tk.Label(self.content_frame, text=f"Email: {user_data['email']}", font=("Arial", 14), fg="#94a3b8", bg="#1e1e2f").pack(pady=5)
        tk.Label(self.content_frame, text=f"Name: {user_data['name']}", font=("Arial", 14), fg="#94a3b8", bg="#1e1e2f").pack(pady=5)
        tk.Label(self.content_frame, text=f"Processor: {decrypt_data(user_data['hardware']['processor'], ENCRYPTION_KEY)}", font=("Arial", 14), fg="#94a3b8", bg="#1e1e2f").pack(pady=5)
        tk.Label(self.content_frame, text=f"RAM: {decrypt_data(user_data['hardware']['ram'], ENCRYPTION_KEY)} GB", font=("Arial", 14), fg="#94a3b8", bg="#1e1e2f").pack(pady=5)
        tk.Label(self.content_frame, text=f"Graphics: {decrypt_data(user_data['hardware']['graphics'], ENCRYPTION_KEY)}", font=("Arial", 14), fg="#94a3b8", bg="#1e1e2f").pack(pady=5)

        # Back button
        back_button = tk.Button(self.content_frame, text="Back to Main", font=("Arial", 14, "bold"), bg="#6200ea", fg="white",
                                activebackground="#3700b3", activeforeground="white", command=self.show_main_screen, width=12)
        back_button.pack(pady=(20, 20))

    def clear_window(self):
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def validate_email(self, email):
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, email) is not None

    def validate_password(self, password):
        if len(password) < 8:
            return False
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'[a-z]', password):
            return False
        if not re.search(r'\d', password):
            return False
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False
        return True

if __name__ == "__main__":
    root = tk.Tk()
    app = SpecsGamingApp(root)
    root.mainloop()

print("Script executed successfully!")