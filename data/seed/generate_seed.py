import os
import random
import csv
from datetime import datetime, timedelta

def generate_dataset(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    random.seed(42) # Replicable randomness
    
    cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre", "Curitiba", "Campinas", "Recife", "Salvador"]
    states = ["SP", "RJ", "MG", "RS", "PR", "SP", "PE", "BA"]
    education_levels = [
        "Ensino Médio", "Ensino Superior", "Pós-Graduação", "Mestrado", "Doutorado"
    ]
    channels = ["LinkedIn", "Indeed", "Indicação", "Gupy", "Site Institucional", "Glassdoor"]
    roles = ["Analista de Dados Júnior", "Analista de Dados Pleno", "Cientista de Dados Júnior", "Engenheiro de Dados Júnior", "Analista de Business Intelligence"]
    stages = ["Triagem", "Teste Técnico", "Entrevista RH", "Entrevista Técnica", "Proposta", "Aprovado", "Reprovado"]
    
    # Standard formats
    date_formats = [
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%Y-%m-%dT%H:%M:%SZ"
    ]
    
    data = []
    
    # Generate 300 base records
    for i in range(1, 301):
        candidate_id = f"CAN{i:04d}"
        
        # Inconsistent timestamp format
        base_date = datetime(2026, 5, 1) + timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        date_fmt = random.choice(date_formats)
        timestamp = base_date.strftime(date_fmt)
        
        # Name
        first_names = ["Felipe", "Mariana", "Lucas", "Beatriz", "Gabriel", "Julia", "Thiago", "Larissa", "Gustavo", "Camila", "Rodrigo", "Amanda", "Bruno", "Sofia", "Matheus", "Isabela"]
        last_names = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes"]
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        
        # Email
        email = f"{name.lower().replace(' ', '.')}@example.com"
        # Email anomalies (approx 5%)
        if random.random() < 0.05:
            anomaly_type = random.randint(0, 2)
            if anomaly_type == 0:
                email = f"{name.lower().replace(' ', '.')}example.com" # missing @
            elif anomaly_type == 1:
                email = "" # null email
            else:
                email = f"{name.lower().replace(' ', '.')}@" # missing domain
                
        # City and State
        city_idx = random.randint(0, len(cities) - 1)
        city = cities[city_idx]
        state = states[city_idx]
        
        # Null values in location (approx 5%)
        if random.random() < 0.05:
            city = ""
            state = ""
            
        # Inconsistent casing for education level (approx 20%)
        edu = random.choice(education_levels)
        if random.random() < 0.20:
            casing = random.randint(0, 2)
            if casing == 0:
                edu = edu.lower()
            elif casing == 1:
                edu = edu.upper()
            else:
                # remove accents/typos or just mixed
                edu = edu.replace("Graduação", "graduacao").replace("Médio", "medio")
                
        # Experience Years
        exp = random.randint(0, 15)
        # Outlier experience (approx 2%)
        if random.random() < 0.02:
            exp = random.choice([45, 99, -2]) # extreme or invalid values
            
        # Inconsistent casing for source channel
        channel = random.choice(channels)
        if random.random() < 0.15:
            casing = random.randint(0, 1)
            if casing == 0:
                channel = channel.upper()
            else:
                channel = channel.lower()
                
        role = random.choice(roles)
        stage = random.choice(stages)
        
        # Scores (0 to 100)
        score_t = random.randint(40, 100)
        score_i = random.randint(50, 100)
        
        # Missing scores (approx 10%)
        if random.random() < 0.10:
            score_t = ""
        if random.random() < 0.10:
            score_i = ""
            
        # Status logic
        if stage in ["Aprovado", "Proposta"]:
            status = "Aprovado"
        elif stage == "Reprovado":
            status = "Reprovado"
        else:
            status = "Em Processo"
            
        # Salary Expectation
        salary = random.randint(3000, 15000)
        # Outlier salary (approx 3%)
        if random.random() < 0.03:
            salary = random.choice([80000, 150000, -500])
            
        # Availability & Remote Preference (optional, with higher null rates)
        avail = random.choice(["Imediata", "15 dias", "30 dias"]) if random.random() > 0.30 else ""
        remote = random.choice(["Presencial", "Híbrido", "Totalmente Remoto"]) if random.random() > 0.25 else ""
        
        data.append([
            candidate_id, timestamp, name, email, city, state, edu, exp,
            channel, role, stage, score_t, score_i, status, salary, avail, remote
        ])
        
    # Introduce duplicates (approx 5 records duplicated)
    for _ in range(5):
        dup_rec = random.choice(data).copy()
        # Maybe slightly change timestamp but keep ID
        data.append(dup_rec)
        
    headers = [
        "candidate_id", "timestamp", "name", "email", "city", "state",
        "education_level", "experience_years", "source_channel", "role_applied",
        "stage", "score_test", "score_interview", "final_status", "salary_expectation",
        "availability", "remote_preference"
    ]
    
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(data)
        
    print(f"Dataset generated successfully at {output_path} with {len(data)} rows.")

if __name__ == "__main__":
    generate_dataset("C:\\dev\\DataFlow\\data\\seed\\processo_seletivo_demo.csv")
