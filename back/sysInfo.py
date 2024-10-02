import psutil # type: ignore
import GPUtil # type: ignore
import math
import cpuinfo # type: ignore
import tkinter as tk

def get_system_info():
    # Información detallada de la CPU
    cpu_info = cpuinfo.get_cpu_info()['brand_raw']  # Obtiene el nombre completo de la CPU

    # Información de la RAM (aproximación hacia arriba)
    ram_info = math.ceil(psutil.virtual_memory().total / (1024 ** 3))  # Redondear hacia arriba
    
    # Información de la tarjeta gráfica
    gpus = GPUtil.getGPUs() 
    if gpus:
        gpu_info = gpus[0].name
    else:
        gpu_info = "Gráficos integrados"

    # Crear un string con la información
    system_info =   f"Procesador: {cpu_info}\n" \
                    f"Tarjeta gráfica: {gpu_info}\n" \
                    f"RAM: {ram_info} GB"
    
    return system_info

def create_gui():
    # Crear la ventana principal
    root = tk.Tk()
    root.title("Información del Sistema")

    # Obtener información del sistema
    system_info = get_system_info()

    # Crear etiquetas para mostrar la información
    label = tk.Label(root, text=system_info, padx=10, pady=10, font=("Helvetica", 12))
    label.pack()

    # Botón para cerrar la ventana
    close_button = tk.Button(root, text="Cerrar", command=root.quit, padx=5, pady=5)
    close_button.pack()

    # Ejecutar la ventana
    root.mainloop()

if __name__ == "__main__":
    create_gui()
