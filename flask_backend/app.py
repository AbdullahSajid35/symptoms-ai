from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the model
model = joblib.load('disease_prediction_model.pkl')

# Mapping from disease to examination
examination_mapping = {
    'Asthma': 'spirometer',
    'Anemia': 'complete blood count (CBC)',
    'covid-19': 'PCR and Molecular COVID-19',
    'Migraine': 'Magnetic resonance imaging (MRI)',
    'Diabetes': 'hemoglobin A1C (HbA1C)',
}

unique_cols = ['cough', 'fatigue', 'dry cough', 'sensitivity to light',
               'breathlessness', 'throbbing headache', 'obesity',
               'chest tightness', 'pale', 'nausea', 'irregular sugar level',
               'wheezing', 'yellowish skin', 'anosmia', 'vomiting',
               'blurred vision', 'chest pain', 'irregular heartbeat', 'ageusia',
               'excessive hunger', 'frequent urination', 'trouble sleeping',
               'dizziness', 'depression', 'excessive thirst', 'other',
               'lightheadedness', 'diarrhea', 'neck stiffness', 'headaches',
               'sensitivity  to sound', 'vaginal infections', 'muscle aches',
               'weight loss', 'cold hands', 'high fever', 'visual disturbances',
               'irritability', 'runny nose', 'polyuria', 'slow healing sore',
               'sore throat']

def encode_custom_symptoms(user_symptoms):
    encoded_symptoms = pd.Series(0, index=unique_cols)
    for symptom in user_symptoms:
        processed_symptom = symptom.lower().strip().replace('-', ' ').replace('_', ' ')
        if processed_symptom in encoded_symptoms.index:
            encoded_symptoms[processed_symptom] = 1
    return encoded_symptoms

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/in')
def inn():
    return 'runing'


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    user_symptoms = data['symptoms']
    encoded_user_symptoms = encode_custom_symptoms(user_symptoms)
    encoded_user_array = encoded_user_symptoms.values.reshape(1, -1)
    prediction = model.predict(encoded_user_array)
    predicted_disease = prediction[0]
    examination = examination_mapping.get(predicted_disease, "No examination found")
    return jsonify({'disease': predicted_disease, 'examination': examination})

if __name__ == '__main__':
    app.run(debug=True)
