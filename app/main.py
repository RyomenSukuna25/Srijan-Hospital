from pathlib import Path
import sqlite3
from datetime import datetime
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

BASE = Path(__file__).resolve().parent.parent
DB = BASE / 'srijan.db'
app = FastAPI(title='Srijan Hospital', docs_url='/api/docs', redoc_url='/api/redoc')
app.mount('/static', StaticFiles(directory=BASE / 'srijan_static'), name='static')
templates = Jinja2Templates(directory=BASE / 'app' / 'templates')

SPECIALTIES = [
('general-medicine','General Medicine','Comprehensive adult medical care, preventive health and chronic disease management.'),
('internal-medicine','Internal Medicine','Diagnosis and long-term management of complex adult health conditions.'),
('critical-care','Critical Care','Continuous monitoring and multidisciplinary care for critically ill patients.'),
('anesthesiology','Anesthesiology','Perioperative assessment, anesthesia planning and pain management support.'),
('diabetology','Diabetology','Structured diabetes care, monitoring and lifestyle-focused management.'),
('obstetrics-gynaecology','Obstetrics & Gynaecology','Women’s health, pregnancy care and comprehensive gynaecological services.'),
('orthopedics','Orthopedics','Assessment and treatment for bone, joint, muscle and mobility conditions.'),
('nephrology','Nephrology','Kidney care, renal disease management and dialysis coordination.'),
('neurology','Neurology','Evaluation and management of disorders affecting the brain, nerves and spine.'),
('cardiology','Cardiology','Heart health assessment, preventive cardiology and cardiac care pathways.'),
('psychiatry','Psychiatry','Confidential assessment and treatment support for mental and behavioural health.'),
('radiology-imaging','Radiology & Imaging','Diagnostic imaging support for accurate clinical decision-making.'),
('dermatology','Dermatology','Medical care for skin, hair and nail conditions across age groups.'),
('pulmonology','Chest Physician (Pulmonology)','Respiratory care for asthma, COPD and other lung conditions.'),
('ent','ENT (Ear, Nose & Throat)','Specialist care for ear, nose, throat and related head-and-neck conditions.'),
('general-surgery','General Surgery','Surgical evaluation and operative care, including minimally invasive pathways.'),
('urology','Urology','Diagnosis and treatment of urinary-tract and male reproductive conditions.'),
('oncology','Oncology (Cancer Care)','Multidisciplinary support for cancer evaluation, treatment planning and follow-up.'),
('pediatrics','Pediatrics (Child Health Care)','Medical care for infants, children and adolescents.'),
('icu','Intensive Care Unit (ICU)','High-dependency critical care with close clinical monitoring.'),
]

SERVICES = [
('Emergency & Critical Care','Immediate assessment and coordinated care for urgent and critical medical needs.','24/7'),
('Advanced Diagnostics','Imaging and laboratory pathways designed to support timely clinical decisions.','Diagnostics'),
('Specialist OPD','Appointments across major medical and surgical specialties.','Consultations'),
('General & Laparoscopic Surgery','Surgical evaluation with minimally invasive options where clinically appropriate.','Surgery'),
('Orthopaedic Care','Care pathways for fractures, joint conditions, mobility and rehabilitation.','Orthopaedics'),
('Cardiac Care','Preventive and diagnostic heart-care pathways with specialist review.','Cardiology'),
('Women’s Health','Pregnancy, gynaecology and women’s preventive-care services.','Women’s Health'),
('Pediatrics','Child-focused consultation, diagnosis and treatment.','Child Health'),
('Dialysis Support','Renal-care coordination and dialysis support pathways.','Nephrology'),
('Pharmacy Support','Convenient access to prescribed medicines and medication guidance.','Pharmacy'),
('Insurance & Cashless Desk','Support with insurance documentation, eligibility and claim coordination.','Insurance'),
('Patient Care & Accommodation','Comfort-focused inpatient support for patients and attendants.','Patient Care'),
]

DOCTORS = [
{'slug':'rohan-mehta','name':'Dr. Rohan Mehta','qualification':'MBBS, MD — Internal Medicine','role':'Consultant — Internal Medicine','bio':'A fictional demonstration profile created for the Srijan Hospital website mockup. Focus areas include adult medicine, preventive care, diabetes and hypertension management.','image':'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=85'},
{'slug':'taniya-nagvekar','name':'Dr. Taniya Nagvekar','qualification':'MBBS, MS — Obstetrics & Gynaecology','role':'Consultant — Obstetrics & Gynaecology','bio':'A fictional demonstration profile created for the Srijan Hospital website mockup. Focus areas include women’s health, pregnancy care and general gynaecological consultation.','image':'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85'},
]

PAGE_IMAGES = {
'home':'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1800&q=85',
'about':'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=85',
'emergency':'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1400&q=85',
'diagnostics':'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85',
}

def db():
    con = sqlite3.connect(DB)
    con.execute('CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT, department TEXT, doctor TEXT, date TEXT, message TEXT, created_at TEXT)')
    con.execute('CREATE TABLE IF NOT EXISTS enquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT, message TEXT, created_at TEXT)')
    con.commit(); return con

def ctx(request, **extra):
    return {'request': request, 'hospital':'Srijan Hospital', 'tagline':'Compassion • Care • Cure', 'specialties':SPECIALTIES, 'services':SERVICES, 'doctors':DOCTORS, **extra}

@app.on_event('startup')
def startup(): db().close()

@app.get('/', response_class=HTMLResponse)
def home(request: Request): return templates.TemplateResponse('home.html', ctx(request, page_image=PAGE_IMAGES['home']))

@app.get('/about', response_class=HTMLResponse)
def about(request: Request): return templates.TemplateResponse('about.html', ctx(request, page_image=PAGE_IMAGES['about']))

@app.get('/services', response_class=HTMLResponse)
def services(request: Request): return templates.TemplateResponse('services.html', ctx(request))

@app.get('/specialities', response_class=HTMLResponse)
def specialties(request: Request): return templates.TemplateResponse('specialities.html', ctx(request))

@app.get('/specialities/{slug}', response_class=HTMLResponse)
def specialty(request: Request, slug: str):
    item = next((x for x in SPECIALTIES if x[0] == slug), None)
    if not item: return templates.TemplateResponse('404.html', ctx(request), status_code=404)
    idx = SPECIALTIES.index(item)
    image = [PAGE_IMAGES['diagnostics'], PAGE_IMAGES['about'], PAGE_IMAGES['home']][idx % 3]
    return templates.TemplateResponse('specialty.html', ctx(request, specialty=item, specialty_image=image))

@app.get('/doctors', response_class=HTMLResponse)
def doctors(request: Request): return templates.TemplateResponse('doctors.html', ctx(request))

@app.get('/doctors/{slug}', response_class=HTMLResponse)
def doctor(request: Request, slug: str):
    item = next((x for x in DOCTORS if x['slug'] == slug), None)
    if not item: return templates.TemplateResponse('404.html', ctx(request), status_code=404)
    return templates.TemplateResponse('doctor.html', ctx(request, doctor=item))

@app.get('/emergency', response_class=HTMLResponse)
def emergency(request: Request): return templates.TemplateResponse('standard.html', ctx(request, title='Emergency & Critical Care', kicker='24/7 CARE', description='For urgent situations, contact local emergency services or the hospital emergency desk. This demo page intentionally uses placeholder contact details until the hospital’s real numbers are supplied.', page_image=PAGE_IMAGES['emergency']))

@app.get('/diagnostics', response_class=HTMLResponse)
def diagnostics(request: Request): return templates.TemplateResponse('standard.html', ctx(request, title='Diagnostics & Imaging', kicker='DIAGNOSTICS', description='A coordinated diagnostic pathway for imaging, pathology and specialist review. Specific equipment and accreditation claims will be added only after confirmation.', page_image=PAGE_IMAGES['diagnostics']))

@app.get('/insurance', response_class=HTMLResponse)
def insurance(request: Request): return templates.TemplateResponse('standard.html', ctx(request, title='Insurance & Cashless Support', kicker='PATIENT FINANCE', description='Insurance eligibility, cashless admission and documentation support can be coordinated through the hospital desk. Partner lists will be added once confirmed.', page_image=PAGE_IMAGES['about']))

@app.get('/patient-care', response_class=HTMLResponse)
def patient_care(request: Request): return templates.TemplateResponse('standard.html', ctx(request, title='Patient Care', kicker='PATIENT EXPERIENCE', description='Comfort, communication, privacy and coordinated support across the patient journey.', page_image=PAGE_IMAGES['home']))

@app.get('/blog', response_class=HTMLResponse)
def blog(request: Request):
    posts=[('Understanding blood pressure','A practical overview of why regular monitoring matters.'),('Preparing for a specialist consultation','Simple steps to make your appointment more useful.'),('When should you seek emergency care?','General guidance for recognising urgent symptoms.')]
    return templates.TemplateResponse('blog.html', ctx(request, posts=posts))

@app.get('/contact', response_class=HTMLResponse)
def contact(request: Request): return templates.TemplateResponse('contact.html', ctx(request))

@app.get('/appointment', response_class=HTMLResponse)
def appointment(request: Request): return templates.TemplateResponse('appointment.html', ctx(request))

@app.post('/appointment')
def appointment_submit(name: str=Form(...), phone: str=Form(...), email: str='', department: str='', doctor: str='', date: str='', message: str=''):
    con=db(); con.execute('INSERT INTO appointments(name,phone,email,department,doctor,date,message,created_at) VALUES(?,?,?,?,?,?,?,?)',(name.strip(),phone.strip(),email.strip(),department.strip(),doctor.strip(),date.strip(),message.strip(),datetime.now().isoformat(timespec='seconds'))); con.commit(); con.close()
    return RedirectResponse('/appointment?success=1',status_code=303)

@app.post('/contact')
def contact_submit(name: str=Form(...), phone: str=Form(...), email: str='', message: str=Form(...)):
    con=db(); con.execute('INSERT INTO enquiries(name,phone,email,message,created_at) VALUES(?,?,?,?,?)',(name.strip(),phone.strip(),email.strip(),message.strip(),datetime.now().isoformat(timespec='seconds'))); con.commit(); con.close()
    return RedirectResponse('/contact?success=1',status_code=303)

@app.get('/api/health')
def health(): return {'status':'ok','hospital':'Srijan Hospital'}
