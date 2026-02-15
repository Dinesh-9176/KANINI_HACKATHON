"""Maps predicted diseases to hospital departments using keyword-based rules."""

# Keywords that map to specific departments
DEPARTMENT_KEYWORDS = {
    "Cardiology": [
        "heart", "cardiac", "cardio", "angina", "arrhythmia", "atrial",
        "coronary", "myocard", "pericardi", "valve", "hypertensive heart",
        "heart attack", "heart failure", "heart block", "heart contusion",
        "tachycardia", "bradycardia", "cardiomyopathy", "endocarditis",
        "aortic", "ventricular", "premature atrial", "premature ventricular",
        "sick sinus", "mitral"
    ],
    "Pulmonology": [
        "lung", "pulmonary", "respiratory", "bronch", "pneumonia", "asthma",
        "copd", "pleural", "pneumothorax", "emphysema", "croup", "tracheitis",
        "ards", "pulmonary fibrosis", "pulmonary hypertension", "apnea",
        "pneumoconiosis", "atelect"
    ],
    "Neurology": [
        "brain", "neuro", "alzheimer", "parkinson", "epilep", "seizure",
        "stroke", "migraine", "meningit", "encephalit", "multiple sclerosis",
        "dementia", "cerebral", "intracranial", "guillain", "neuropath",
        "als", "huntington", "myasthenia", "narcolepsy", "tourette",
        "trigeminal", "bell palsy", "concussion", "head injury",
        "subarachnoid", "subdural", "tremor", "ataxia", "hydrocephalus",
        "moyamoya", "optic neurit"
    ],
    "Orthopedics": [
        "fracture", "bone", "joint", "arthritis", "osteo", "sprain",
        "dislocation", "spondyl", "sciatica", "rotator cuff", "tendinit",
        "bursitis", "carpal tunnel", "meniscus", "ligament", "bunion",
        "plantar fasciitis", "scoliosis", "spinal stenosis", "disc",
        "lumbago", "back pain", "knee", "hip", "shoulder", "tennis elbow",
        "trigger finger", "hammer toe", "flat feet", "ganglion",
        "chondromalacia", "adhesive capsulitis"
    ],
    "Gastroenterology": [
        "gastro", "liver", "hepat", "pancrea", "bowel", "colon",
        "esophag", "stomach", "intestin", "gallstone", "cholecyst",
        "appendicitis", "hernia", "ulcer", "celiac", "crohn",
        "diverticul", "irritable bowel", "cirrhosis", "gerd",
        "ileus", "volvulus", "intussusception", "gastroparesis",
        "cholangitis", "choledocholithiasis", "indigestion"
    ],
    "Dermatology": [
        "skin", "dermatit", "eczema", "psoriasis", "acne", "rash",
        "melanoma", "rosacea", "lichen", "impetigo", "cellulitis",
        "fungal infection of the skin", "warts", "scabies", "hives",
        "pemphigus", "scleroderma", "vitiligo", "alopecia", "seborrheic",
        "keratosis", "lipoma", "hidradenitis", "acanthosis", "scar",
        "intertrigo", "pityriasis", "callus", "burn", "frostbite",
        "decubitus", "diaper rash"
    ],
    "Ophthalmology": [
        "eye", "vision", "retina", "glaucoma", "cataract", "cornea",
        "conjunctivit", "optic", "macular", "blephar", "iridocyclit",
        "uveitis", "vitreous", "stye", "pterygium", "amblyopia",
        "astigmatism", "myopia", "hyperopia", "presbyopia", "floaters",
        "pinguecula", "scleritis", "chalazion", "trichiasis", "aphakia",
        "endophthalmitis", "subconjunctival"
    ],
    "ENT": [
        "ear", "nose", "throat", "sinus", "tonsil", "laryngit",
        "pharyngit", "otitis", "hearing", "tinnitus", "deviated nasal",
        "nasal polyp", "cholesteatoma", "mastoidit", "eustachian",
        "peritonsillar", "vocal cord", "salivary", "sialoadenitis",
        "presbyacusis", "otosclerosis", "strep throat", "herpangina"
    ],
    "Nephrology": [
        "kidney", "renal", "nephro", "urinary tract infection",
        "pyelonephrit", "kidney stone", "cystitis", "hydronephrosis",
        "glomerulo", "polycystic kidney", "dialysis", "bladder"
    ],
    "Oncology": [
        "cancer", "tumor", "carcinoma", "sarcoma", "leukemia",
        "lymphoma", "myeloma", "metastatic", "malignant", "neoplasm",
        "myelodysplastic", "polycythemia vera", "kaposi",
        "meningioma", "ependymoma"
    ],
    "Endocrinology": [
        "diabetes", "thyroid", "adrenal", "pituitary", "cushing",
        "goiter", "graves", "hashimoto", "hypoglycemia", "insulin",
        "parathyroid", "hormone disorder", "metabolic",
        "hypothyroidism", "diabetic", "glucocorticoid"
    ],
    "Psychiatry": [
        "anxiety", "depression", "bipolar", "schizophren", "ptsd",
        "panic", "obsessive", "eating disorder", "phobia", "psychotic",
        "personality disorder", "adhd", "autism", "substance",
        "alcohol abuse", "drug abuse", "marijuana", "dissociative",
        "somatization", "factitious", "impulse control", "conduct disorder",
        "adjustment", "dysthymic", "insomnia", "stress reaction",
        "conversion disorder", "psychosexual"
    ],
    "Urology": [
        "prostat", "urethral", "urethritis", "testicular", "epididym",
        "varicocele", "hydrocele", "cryptorchidism", "priapism",
        "phimosis", "balanitis", "spermatocele", "peyronie",
        "incontinence", "vesicoureteral", "erectile"
    ],
    "Gynecology": [
        "ovarian", "uterine", "vaginal", "vulvar", "endometri",
        "cervic", "menstrual", "menopause", "pregnancy", "pcos",
        "fibroids", "pelvic inflammatory", "vaginit", "vulvodynia",
        "placenta", "preeclampsia", "ectopic pregnancy", "abortion",
        "postpartum", "galactorrhea", "infertility", "vaginismus",
        "premenstrual"
    ],
    "Hematology": [
        "anemia", "hemophilia", "sickle cell", "thalassemia",
        "thrombocytopenia", "coagulation", "von willebrand",
        "hemolytic", "aplastic", "iron deficiency", "polycythemia",
        "thrombocythemia", "spherocytosis", "g6pd"
    ],
    "Infectious Disease": [
        "hiv", "tuberculosis", "malaria", "dengue", "typhoid",
        "syphilis", "gonorrhea", "chlamydia", "herpes", "hepatitis",
        "mononucleosis", "lyme", "rocky mountain", "toxoplasmosis",
        "chickenpox", "mumps", "whooping cough", "scarlet fever",
        "sepsis", "meningitis", "shingles", "trichomonas",
        "histoplasmosis", "cryptococcosis", "aspergillosis", "hpv"
    ],
    "Rheumatology": [
        "lupus", "rheumatoid", "vasculitis", "fibromyalgia",
        "polymyalgia", "sjogren", "reactive arthritis",
        "ankylosing spondylitis", "raynaud", "gout",
        "juvenile rheumatoid", "complex regional pain"
    ],
    "Pediatrics": [
        "teething", "infant", "neonatal", "fetal alcohol",
        "hirschsprung", "down syndrome", "edward syndrome",
        "turner syndrome", "spina bifida", "tuberous sclerosis",
        "cystic fibrosis"
    ],
    "Emergency": [
        "poisoning", "overdose", "trauma", "injury", "open wound",
        "cardiac arrest", "anaphylaxis", "envenomation", "carbon monoxide",
        "heat stroke", "heat exhaustion", "hemorrhage", "shock",
        "crushing", "foreign body"
    ],
    "General Medicine": [
        "common cold", "flu", "allergy", "obesity", "fatigue",
        "pain disorder", "fever", "vitamin", "protein deficiency",
        "scurvy", "smoking", "dehydration", "hypovolemia"
    ]
}


def map_disease_to_department(disease: str) -> str:
    """Map a disease name to a hospital department."""
    disease_lower = disease.lower()

    for department, keywords in DEPARTMENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in disease_lower:
                return department

    return "General Medicine"
