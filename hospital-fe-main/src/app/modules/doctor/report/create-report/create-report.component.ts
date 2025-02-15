import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
import { Doctor } from 'src/app/modules/hospital/model/doctor.model';
import { Medicine } from 'src/app/modules/hospital/model/medicine-model';
import { Prescription } from 'src/app/modules/hospital/model/prescription.model';
import { Report } from 'src/app/modules/hospital/model/report.model';
import { Symptom } from 'src/app/modules/hospital/model/symptom.module';
import { DoctorService } from 'src/app/modules/hospital/services/doctor-service';
import { ReportService } from '../report.service';
import { MatStepper } from '@angular/material/stepper';
import { GoBackToSelection, Selection } from '../event-sourcing/GoBackToSelection';
import { ReportEventSourcingService } from '../report-event-sourcing.service';
import { StartScheduling } from '../event-sourcing/StartScheduling';
import { ChooseSymptom } from '../event-sourcing/ChooseSymptom';
import { FinishScheduling } from '../event-sourcing/FinishScheduling';
import { ChooseReportText } from '../event-sourcing/ChooseReportText';
import { ChooseMedicine } from '../event-sourcing/ChooseMedicine';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.css']
})
export class CreateReportComponent implements OnInit {
  //Javascript things... (Component can only access types defined in its own .ts file)
  public Selection = Selection
  //Used for event sourcing
  sessionId: string = "";
  @ViewChild('stepper',{read:MatStepper}) stepper: MatStepper | undefined;

  constructor(private _formBuilder: FormBuilder, private reportService: ReportService, private readonly doctorService: DoctorService, private readonly eventSourcingService:ReportEventSourcingService) { }

  report: Report = new Report()
  loggedDoctor: Doctor = new Doctor()

  success: boolean = false

  symptoms: Symptom[] = []
  selectedSymptom = ""
  symptomsDataSource: Symptom[] = []
  selectedSymptoms: Symptom[] = []

  reportText = ''

  medicine: Medicine[] = []
  selectedMedicine = ""
  medicineDataSource: Medicine[] = []
  selectedMedicines: Medicine[] = []
  selectedMedicinesForEvent: Medicine[] = []

  prescriptions: Prescription[] = []
  newPrescription: Prescription = new Prescription()
  prescriptionsDataSource: Prescription[] = []

  displayedColumns: string[] = ['name', 'remove']
  displayedPrescriptionColumns: string[] = ['medicine', 'remove']

  disableButton = false

  ngOnInit(): void {
    this.doctorService.getLoggedDoctor().subscribe(res =>{
      this.loggedDoctor = res
    })
    this.reportService.getSymptoms().subscribe(res =>{
      this.symptoms = res
    })
    this.reportService.getMedicine().subscribe(res =>{
      this.medicine = res
    })
    this.StartSchedulingSession();
  }

  addSymptom(event: any): void {
    if (this.selectedSymptoms.find(sym => sym.id === event.value.id) === undefined){
      this.selectedSymptoms.push(event.value)
      this.symptomsDataSource = [...this.selectedSymptoms]
    }
  }

  removeSymptom(id: string): void {
    let index = this.selectedSymptoms.findIndex(sym => sym.id === id)
    this.selectedSymptoms.splice(index, 1)
    this.symptomsDataSource = [...this.selectedSymptoms]
  }

  addMedicine(event: any): void {
    if (this.selectedMedicines.find(med => med.id === event.value.id) === undefined){
      this.selectedMedicines.push(event.value)
      this.medicineDataSource = [...this.selectedMedicines]
    }
  }

  removeMedicine(id: string): void {
    let index = this.selectedMedicines.findIndex(med => med.id === id)
    this.selectedMedicines.splice(index, 1)
    this.medicineDataSource = [...this.selectedMedicines]
  }

  addPrescription(): void {
    if (this.selectedMedicines.length > 0){
      this.newPrescription.medicines = [...this.selectedMedicines]
      this.prescriptions.push(this.newPrescription)
      this.prescriptionsDataSource = [...this.prescriptions]
      this.selectedMedicinesForEvent = this.selectedMedicines
      this.selectedMedicines = []
      this.medicineDataSource = [...this.selectedMedicines]
      this.newPrescription = new Prescription()
    }
  }

  removePrescription(id: string): void {
    let index = this.prescriptions.findIndex(pre => pre.id === id)
    this.prescriptions.splice(index, 1)
    this.prescriptionsDataSource = [...this.prescriptions]
  }

  prescriptionMedicineToString(medicines: Medicine[]): string {
    let s = ''
    medicines.forEach(function(value){
      s += value.name + ' '
    })
    return s
  }

  createReport(): void {
    if (this.validateInput()){
      this.recordScheduleFinishing()
      let date = new Date().toDateString()
      this.prescriptions.forEach(prescription => prescription.dateTime = date)
      this.report.symptoms = [...this.selectedSymptoms]
      this.report.text = this.reportText
      this.report.prescriptions = [...this.prescriptions]
      this.report.dateTime = date
      this.report.medicalAppointmentId = String(localStorage.getItem('selectedAppointment'))
      this.reportService.createReport(this.report).subscribe(res => {
        this.success = true
        this.disableButton = true
        localStorage.removeItem('selectedAppointment')
      })
    }
    else{
      this.success = false
    }
  }

  validateInput(): boolean {
    if (this.selectedSymptoms.length === 0 || this.reportText === '' || this.prescriptions.length === 0){
      return false
    }
    return true
  }

    // event sourcing
  StartSchedulingSession = (): void => {
    let dto : StartScheduling = {
      OccurenceTime : new Date()
    } 

    this.eventSourcingService.startSchedulingSession(dto).subscribe((response : string) =>{
      this.sessionId = response;
    });
  }

  private recordScheduleFinishing() {
    let Dto: FinishScheduling = {
      AggregateId: this.sessionId,
      OccurenceTime: new Date(),
      Time: new Date()
    };

    this.eventSourcingService.finishScheduling(Dto).subscribe();
  }

  recordGoingBackToSelection(selection : Selection)
  {
    let dto : GoBackToSelection = {
      AggregateId : this.sessionId,
      OccurenceTime : new Date(),
      Selection : selection
    }

    this.eventSourcingService.goBackToSelection(dto).subscribe();
  }

  ChooseSymptom = ():void =>
  {
    let dto : ChooseSymptom = {
      AggregateId : this.sessionId,
      NumberOfSymptoms : this.selectedSymptoms.length,
      OccurenceTime : new Date()

    }
    this.eventSourcingService.chooseSymptom(dto).subscribe();
  }

  ChooseReportText = ():void =>
  {
    let dto : ChooseReportText = {
      AggregateId : this.sessionId,
      ReportText : this.reportText,
      OccurenceTime : new Date()

    }
    this.eventSourcingService.chooseReportText(dto).subscribe();
  }


  ChooseMedicine = ():void =>
  {
    let dto : ChooseMedicine = {
      AggregateId : this.sessionId,
      NumberOfMedicines : this.selectedMedicinesForEvent.length,
      OccurenceTime : new Date()

    }
    this.eventSourcingService.chooseMedicine(dto).subscribe();
  }


}
