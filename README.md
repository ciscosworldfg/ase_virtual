# AISE Virtual

AISE VIRTUAL — Automotive Industry Shop Experience

**Plug and Learn. Diagnose. Repair. Master.**

AI-guided automotive education through interactive vehicle simulations, diagnostic practice, and shop-oriented training.

You are building a production-quality MVP for AISE Virtual, an immersive automotive diagnostic, training, assessment, and AI coaching platform.

Do NOT build this as a generic educational website.

Build it as a professional automotive simulation platform that feels like a combination of:

- ASE training center

- Professional diagnostic scan tool

- Virtual test-drive simulator

- Automotive technical school

- AI master technician

- Dealership training system

- DIY automotive learning platform

- Interactive diagnostic video game

The primary differentiator is:

«Don't just ask users automotive questions. Put them inside the diagnostic problem.»

The user should hear the vehicle, observe symptoms, drive the vehicle, inspect it, use diagnostic tools, interpret data, determine the root cause, and explain the repair.

---

1. PRODUCT NAME

Official name:

AISE Virtual

Full name:

Automotive Industry Shop Experience

Tagline:

Plug and Learn.

Supporting line:

Diagnose. Repair. Master.

Positioning:

An AI-guided virtual automotive shop and diagnostic learning platform. Students learn through interactive simulations, structured instruction, evidence-based troubleshooting, and practical skill development.

Brand direction:

- Premium, professional wordmark
- Deep navy, white, and electric blue
- Bold, clean typography
- No car or wrench symbols
- Consistent use of “AISE Virtual” across product copy and documentation

The product name is locked. Do not rename the platform or introduce alternate product names without explicit owner approval.

2. MVP OBJECTIVE

The MVP must prove one thing:

«Can a user learn automotive diagnosis significantly better by interacting with a simulated vehicle than by simply reading questions and answers?»

The MVP therefore needs one extremely polished diagnostic experience.

Do NOT attempt to build hundreds of incomplete features.

Build a smaller number of features extremely well.

The first version must include:

1. Landing page

2. User onboarding

3. Training dashboard

4. Scenario library

5. Virtual customer

6. Symptom presentation

7. Virtual test drive

8. Vehicle audio

9. Dashboard warning lights

10. Interactive diagnostic tools

11. OBD-II scanner

12. Live data

13. Virtual multimeter

14. Diagnostic decision system

15. Multiple-choice diagnosis

16. Explanation when correct

17. Remedial lesson when incorrect

18. AI Master Technician

19. Progress tracking

20. ASE category tracking

21. Beginner DIY training

22. Automotive sales AI

23. Service-estimate AI

Everything else should be architected so it can be added later.

---

3. CORE USER EXPERIENCE

The central experience should follow this sequence:

STEP 1 — SELECT VEHICLE

User chooses:

- Vehicle year

- Make

- Model

- Engine

- Mileage

- Transmission

- Drive type

For MVP, provide a curated vehicle library.

Do not attempt to support every vehicle ever manufactured.

Instead create representative vehicle configurations.

Example:

2018 Honda Accord

2.0L Turbo I4

10-speed automatic

2015 Ford F-150

5.0L V8

6-speed automatic

2012 Toyota Camry

2.5L I4

6-speed automatic

2019 Chevrolet Silverado

5.3L V8

2021 Ford Explorer

3.0L Turbo V6

2020 Toyota Prius

Hybrid

2022 Tesla Model 3

EV

The architecture must allow hundreds of additional configurations later.

---

4. ENGINE SIMULATION ENGINE

This is one of the most important systems.

Create an abstract Vehicle Simulation Engine.

Do NOT hard-code individual scenarios into UI components.

Create structured vehicle definitions.

Each vehicle should have:

Vehicle

 ├── Engine

 ├── Fuel System

 ├── Ignition System

 ├── Air Induction

 ├── Exhaust

 ├── Cooling

 ├── Lubrication

 ├── Electrical

 ├── Transmission

 ├── Suspension

 ├── Steering

 ├── Brakes

 ├── HVAC

 ├── Sensors

 ├── Modules

 └── Diagnostic Conditions

The simulation engine should support:

Engines

- Inline 3

- Inline 4

- Inline 5

- Inline 6

- V6

- V8

- V10

- V12

- Rotary

- Hybrid

- Plug-in hybrid

- EV

Forced induction

- Naturally aspirated

- Turbocharged

- Twin turbo

- Supercharged

Fuel systems

- Carburetor

- Throttle-body injection

- Multi-port injection

- Direct injection

- Hybrid fuel systems

Modern engine technology

- Variable valve timing

- Variable valve lift

- Cylinder deactivation

- Start/stop

- Electronic throttle control

- Turbo wastegate systems

- EGR

- EVAP

- PCV

- DPF where appropriate

- SCR/DEF where appropriate

The simulation engine must separate:

vehicle configuration

from

failure condition

from

observed symptom

from

diagnostic evidence

This allows the same vehicle to generate many different scenarios.

---

5. REALISTIC ENGINE AUDIO

Create an extensible Engine Audio System.

The interface must be capable of playing different sounds based on:

- RPM

- throttle position

- engine load

- temperature

- engine configuration

- failure condition

Sound categories:

Normal

- Cold start

- Warm idle

- Acceleration

- Deceleration

- High RPM

- Low RPM

Mechanical

- Rod knock

- Main bearing noise

- Piston slap

- Valve train tick

- Timing chain noise

- Belt noise

- Pulley bearing noise

- Water pump bearing

- Alternator bearing

Combustion

- Misfire

- Detonation

- Pre-ignition

- Rough combustion

Intake/exhaust

- Vacuum leak

- Exhaust leak

- Intake leak

- Turbo whistle

- Wastegate noise

Drivetrain

- CV axle clicking

- Wheel bearing hum

- Differential whine

- Transmission whine

- Clutch chatter

Brakes

- Brake squeal

- Grinding

- Pulsation feedback

The audio engine should support future integration of high-quality recorded vehicle sounds.

For MVP, use clearly labeled placeholder/generated audio assets where real recordings are unavailable.

Do NOT falsely represent synthetic sounds as recordings from real vehicles.

---

6. CUSTOMER SYMPTOM SYSTEM

Before touching the vehicle, the user receives a customer complaint.

Example:

«"The engine started running rough yesterday. The check engine light came on and it feels worse when I'm sitting at a red light."»

The user should be able to:

- Read the complaint

- Listen to the customer

- Ask questions

- Receive contextual answers

Possible questions:

- When did it begin?

- Is it worse cold or hot?

- Does it happen under acceleration?

- Does it happen at idle?

- Has anything been repaired?

- Was the vehicle recently serviced?

- Does the warning light stay on?

- Is the vehicle losing power?

The AI customer must NOT reveal the diagnosis directly.

It should behave like a realistic customer.

---

7. VIRTUAL TEST DRIVE

Create the central interactive test-drive screen.

The user should see:

Left/center

Virtual road/environment.

Bottom

Vehicle controls:

- Accelerate

- Brake

- Steering

- Gear selection where appropriate

Right

Digital instrument cluster.

Display:

- Speed

- RPM

- Fuel

- Temperature

- Oil pressure

- Battery/charging

- Warning indicators

During the drive, the simulation can trigger symptoms.

Examples:

- Misfire under load

- Transmission flare

- Brake vibration

- Steering pull

- Wheel bearing noise

- Overheating

- Loss of power

- Stalling

- ABS activation

- Warning light

Allow the user to repeat the test drive.

---

8. VIRTUAL GARAGE

After the test drive, user enters:

Virtual Garage

Create an interactive vehicle inspection environment.

Clickable systems:

- Engine bay

- Battery

- Air intake

- Fuse box

- Brake system

- Suspension

- Wheels

- Fluids

- Exhaust

- Transmission

- Cooling system

Clicking a component opens an inspection panel.

Example:

Battery:

- Visual condition

- Voltage

- Terminals

- Ground

- Charging system

---

9. VIRTUAL SCAN TOOL

Create a realistic OBD-II diagnostic interface.

Functions:

Read Codes

Example:

P0301

Cylinder 1 Misfire Detected

Clear Codes

Require confirmation.

Freeze Frame

Show:

- RPM

- Load

- Coolant temperature

- Fuel trims

- Vehicle speed

- Throttle position

Live Data

Display:

- RPM

- MAF

- MAP

- STFT

- LTFT

- O2 sensors

- A/F ratio

- Coolant temperature

- Intake air temperature

- Throttle position

- Ignition timing

- Fuel pressure where applicable

Create real-time charts.

The data must change based on simulation state.

Do not display random numbers.

The simulation should calculate plausible relationships between values.

---

10. VIRTUAL MULTIMETER

Create an interactive digital multimeter.

Modes:

- DC voltage

- AC voltage

- Resistance

- Continuity

Allow probes to be placed on virtual test points.

Examples:

Battery:

12.6V

Running:

14.2V

Bad ground:

High voltage drop

Open circuit:

OL

Short:

Near-zero resistance

The user must determine where to place the probes.

---

11. DIAGNOSTIC LOGIC ENGINE

This is the intellectual core of the application.

Do not simply ask:

"What is wrong?"

Instead track:

Customer Complaint

        ↓

Symptoms

        ↓

Initial Inspection

        ↓

Test Drive

        ↓

Diagnostic Codes

        ↓

Live Data

        ↓

Testing

        ↓

Evidence

        ↓

Hypothesis

        ↓

Confirmation Test

        ↓

Root Cause

        ↓

Repair

        ↓

Verification

The system should reward correct diagnostic reasoning.

Do not reward guessing.

A user who guesses the correct component without performing the correct diagnostic procedure should receive partial credit rather than full credit.

---

12. DIAGNOSTIC MULTIPLE CHOICE

After investigation, present:

What is the most likely root cause?

Example:

A. Failed ignition coil

B. Vacuum leak

C. Failed fuel injector

D. Low fuel pressure

Then:

What test should you perform next?

A. Replace the oxygen sensor

B. Smoke test the intake

C. Replace spark plugs

D. Replace the ECU

Then:

What repair should be performed?

Require the user to distinguish:

symptom → cause → confirmation → repair

---

13. WRONG ANSWER LESSON ENGINE

Never simply say:

"Incorrect."

Instead show:

Diagnostic Review

Your answer: Failed oxygen sensor

Result: Incorrect.

What the evidence showed

Fuel trims were strongly positive at idle but improved significantly under increased RPM.

Master Technician Reasoning

That pattern can indicate an intake/vacuum leak rather than immediately condemning the oxygen sensor.

Lesson

Teach the diagnostic principle.

Then provide:

Try the diagnostic step again.

The user should be able to return to the simulation.

---

14. AI MASTER TECHNICIAN

Create a persistent AI mentor named:

MASTER TECH

Personality:

- Experienced

- Precise

- Patient

- Direct

- Never invents measurements

- Never pretends to have performed a test

- Explains technician reasoning

- Encourages confirmation testing

The AI must distinguish between:

known evidence

and

hypothesis

It should say:

"Based on the available evidence..."

rather than pretending certainty.

The AI should be capable of teaching:

A1 through A8

L1

---

15. ASE TRAINING STRUCTURE

Create:

A1 — Engine Repair

A2 — Automatic Transmission/Transaxle

A3 — Manual Drivetrain & Axles

A4 — Suspension & Steering

A5 — Brakes

A6 — Electrical/Electronic Systems

A7 — Heating & Air Conditioning

A8 — Engine Performance

L1 — Advanced Engine Performance Specialist

Each category gets:

- Lessons

- Diagnostic scenarios

- Practice questions

- Simulations

- Skill score

- Weak-area tracking

IMPORTANT:

Do not claim the platform is officially affiliated with or endorsed by ASE unless appropriate authorization exists.

Clearly position this as:

ASE-aligned preparation/training

rather than official ASE certification.

---

16. BEGINNER DIY MODE

Create a separate experience:

DIY Garage

For people who know almost nothing about cars.

Lessons:

- How an engine works

- How to check engine oil

- How to check coolant

- How to check tire pressure

- How to change a tire

- How to safely use a jack

- How to jump-start a vehicle

- How to replace a battery

- How to replace wiper blades

- Basic brake inspection

- Basic maintenance schedule

Use visual step-by-step instructions.

Before dangerous procedures, show safety warnings.

Never encourage unsafe vehicle lifting or electrical procedures.

---

17. AUTOMOTIVE SERVICE ADVISOR AI

Create:

SERVICE AI

Capabilities:

- Customer intake

- Symptom translation

- Estimate explanation

- Maintenance recommendations

- Repair explanations

- Customer objections

Example:

Customer:

"Why does this repair cost $900?"

AI:

Explains:

- Labor

- Parts

- Diagnostic time

- Shop supplies where appropriate

- Why the repair matters

- What happens if ignored

Do not allow the AI to fabricate prices.

Use configurable shop pricing.

---

18. ESTIMATE BUILDER

Create a professional estimate generator.

Fields:

- Customer

- Vehicle

- Mileage

- Complaint

- Diagnosis

- Parts

- Labor hours

- Labor rate

- Taxes

- Shop fees

- Warranty

- Notes

Generate:

Customer Estimate

and

Technician Diagnostic Report

Keep them visually distinct.

---

19. AUTOMOTIVE SALES AI

Create:

SALES AI

This is a separate AI agent.

Train it to teach ethical automotive sales.

Modules:

- Greeting

- Needs discovery

- Vehicle presentation

- Feature/benefit explanation

- Test drive

- Trade-in conversation

- Objection handling

- Follow-up

- Customer retention

The AI can role-play:

- First-time buyer

- Skeptical customer

- Price-sensitive buyer

- Family buyer

- Performance enthusiast

- EV shopper

Never teach deceptive sales practices.

---

20. AI ROLEPLAY ENGINE

Create a reusable roleplay engine.

Each AI character has:

Character

Objective

Personality

Knowledge

Emotional State

Difficulty

Hidden Information

Conversation Rules

Success Conditions

Failure Conditions

The AI should stay in character during roleplay.

After the exercise, switch into:

COACH MODE

and explain what the user did well and what they should improve.

---

21. DASHBOARD

Create a premium dashboard.

Display:

Overall Automotive Skill

0–100

ASE Progress

A1

A2

A3

A4

A5

A6

A7

A8

L1

Diagnostic Accuracy

First-Time Correct Rate

Diagnostic Efficiency

Safety Score

Weakest Skill

Recent Scenarios

Recommended Training

---

22. SKILL SCORE

Do not calculate skill purely from correct answers.

Use:

Diagnostic Accuracy

+

Testing Procedure

+

Evidence Interpretation

+

Safety

+

Repair Selection

+

Time Efficiency

+

Explanation Quality

Create a weighted scoring system.

Example:

Diagnostic accuracy: 30%

Testing procedure: 20%

Evidence interpretation: 20%

Safety: 10%

Repair selection: 10%

Efficiency: 10%

Make the weights configurable.

---

23. SCENARIO GENERATOR

Create a scenario-generation architecture.

Each scenario contains:

Vehicle

Complaint

Symptoms

Failure

Expected Evidence

Possible Codes

Live Data

Audio

Dashboard Events

Correct Tests

Incorrect Tests

Root Cause

Repair

Lesson

Difficulty

ASE Category

Difficulty:

Beginner

Intermediate

Advanced

Master

The same failure can generate different scenarios.

Example:

A misfire scenario could be caused by:

- Spark plug

- Ignition coil

- Injector

- Vacuum leak

- Compression problem

- Wiring

- ECU driver

- Fuel pressure

This prevents users from memorizing answers.

---

24. SCENARIO RANDOMIZATION

Randomize:

- Vehicle

- Mileage

- Weather

- Engine temperature

- Symptom severity

- Customer description

- Failure component

- Diagnostic evidence

- Code combinations

But NEVER randomize values in a way that creates impossible automotive conditions.

Every scenario must pass validation rules.

---

25. SAFETY SYSTEM

Create a prominent safety layer.

The platform is educational simulation software.

It must distinguish:

Simulation

from

real-world repair instructions.

For real-world maintenance, show appropriate safety guidance.

Create an emergency stop:

STOP SIMULATION

and an AI safety interrupt when a dangerous procedure is being attempted.

---

26. DATABASE ARCHITECTURE

Use a scalable relational architecture.

Recommended:

PostgreSQL / Supabase.

Core tables:

users

profiles

vehicles

vehicle_engines

vehicle_systems

sensors

diagnostic_codes

scenarios

scenario_symptoms

scenario_failures

scenario_tests

scenario_evidence

scenario_answers

scenario_lessons

training_modules

ase_categories

user_progress

user_attempts

diagnostic_sessions

diagnostic_events

skill_scores

achievements

ai_agents

ai_sessions

estimates

customers

sales_roleplays

maintenance_lessons

audio_assets

simulation_assets

audit_logs

Keep the architecture modular.

---

27. FRONTEND ARCHITECTURE

Use:

- React

- TypeScript

- Tailwind CSS

- shadcn/ui

- Responsive design

Create reusable components.

Important components:

VehicleSelector

DiagnosticDashboard

VirtualDashboard

TestDrive

VehicleInspection

ScanTool

Multimeter

LiveDataChart

CustomerChat

DiagnosticTimeline

AnswerPanel

LessonPanel

MasterTechPanel

SkillMeter

ASEProgress

ScenarioCard

EstimateBuilder

RoleplayPanel

---

28. MOBILE RESPONSIVENESS

The application must work on:

- Desktop

- Laptop

- Tablet

- Mobile

However:

The full simulator should be optimized primarily for desktop/tablet.

Mobile should provide:

- Lessons

- Questions

- Dashboard

- AI coaching

- Progress

---

29. VISUAL DESIGN

Create a premium automotive technology interface.

Avoid generic SaaS styling.

Visual direction:

Professional digital instrument cluster + modern automotive engineering laboratory.

Use:

- Dark interface

- High contrast

- Metallic/technical visual language

- Instrument-cluster cards

- Diagnostic graphs

- Vehicle silhouettes

- Subtle motion

- Clean typography

- Professional data visualization

Use animation sparingly.

Performance is more important than visual effects.

---

30. LANDING PAGE

Hero:

MASTER THE DIAGNOSIS BEFORE YOU TOUCH THE CAR.

Subheading:

An AI-powered virtual automotive laboratory where you diagnose real-world problems, test vehicles, interpret scan data, and build technician-level skills.

CTA:

START DIAGNOSTIC TRAINING

Secondary:

EXPLORE THE SIMULATOR

Show an interactive preview of:

Customer complaint → Test drive → Scan tool → Diagnosis → Lesson

---

31. ONBOARDING

Ask:

What are you here to accomplish?

Options:

- Become an automotive technician

- Prepare for ASE exams

- Improve diagnostic skills

- Learn DIY maintenance

- Train employees

- Improve automotive sales skills

- Become a service advisor

Then:

Experience

- Complete beginner

- DIY

- Student

- Apprentice

- Technician

- Master-level technician

Customize the dashboard accordingly.

---

32. PERFORMANCE REQUIREMENTS

This is critical.

Do NOT create a giant frontend bundle.

Use:

- Lazy loading

- Code splitting

- Component-level loading

- Efficient state management

- Debounced AI requests

- Cached static data

- Optimized audio

- Compressed assets

- Pagination

- Virtualized lists where appropriate

The simulator should remain responsive.

Do not load every scenario, audio file, vehicle model, or lesson at startup.

---

33. AI ARCHITECTURE

Never expose private AI API keys in frontend code.

All AI calls must go through secure server-side functions.

Use structured AI outputs.

Example:

{

  "diagnostic_assessment": {

    "likely_causes": [],

    "evidence": [],

    "recommended_test": "",

    "confidence": 0,

    "safety_warning": null

  }

}

AI must never invent:

- Diagnostic codes

- Sensor readings

- Repair history

- Vehicle specifications

- Test results

AI should only reason from simulation state and approved knowledge.

---

34. KNOWLEDGE ARCHITECTURE

Create a knowledge layer that separates:

Automotive Knowledge

from

Scenario State

from

User Progress

from

AI Conversation

This allows the platform to eventually use a retrieval system/RAG architecture.

The knowledge base should eventually contain:

- Automotive fundamentals

- Diagnostic procedures

- System operation

- Electrical theory

- Engine performance

- Maintenance

- Safety

- ASE-aligned concepts

Do not copy copyrighted ASE test questions.

Create original training content based on publicly available technical concepts and properly licensed/reference material.

---

35. ADMIN DASHBOARD

Create an admin interface.

Admin can:

- Create scenarios

- Edit scena

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df9b8e60-00a5-4f00-a589-38ecb967ecc9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```