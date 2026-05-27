import tensorflow as tf
import numpy as np
from PIL import Image 

# 1. Cargar el modelo exportado (usando el Keras integrado en TF 2.15)
model = tf.keras.models.load_model('keras_model.h5', compile=False)

def predict_species(image_path):
    # 2. Cargar imagen nativamente con PIL
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    
    # 3. Convertir a matriz numérica
    img_array = np.array(img, dtype=np.float32)
    
    # 4. Aumentar dimensión
    img_array = np.expand_dims(img_array, axis=0)
    
    # 5. Normalizar
    img_array /= 255.0 
    
    # 6. Predecir
    prediction = model.predict(img_array)
    species_index = np.argmax(prediction) 
    
    return species_index

# --- PRUEBA LOCAL ---
image_path = 'prueba.jpg' # Tu foto de prueba
resultado = predict_species(image_path)

clases = ["Gallito de las Rocas", "Pingüino de Humboldt"]

print("\n" + "="*40)
print(f" RESULTADO: {clases[resultado]}")
print("="*40 + "\n")