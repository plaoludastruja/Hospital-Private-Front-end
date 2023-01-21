import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Doctor } from 'src/app/modules/hospital/model/doctor.model';
import { DoctorService } from 'src/app/modules/hospital/services/doctor-service';
import { Appointment } from '../../../hospital/model/appointment.model';
import { ReportService } from '../../report/report.service';
import { AddOrEditAppointmentDialogComponent } from '../add-or-edit-appointment-dialog/add-or-edit-appointment-dialog.component';
import { CancelAppointmentDialogComponent } from '../cancel-appointment-dialog/cancel-appointment-dialog.component';
import { DoctorAppointmentService } from '../doctor-appointment.service';

@Component({
  selector: 'app-doctor-scheduler',
  templateUrl: './doctor-scheduler.component.html',
  styleUrls: ['./doctor-scheduler.component.css']
})
export class DoctorSchedulerComponent implements OnInit {

  public dataSource : Appointment[] = [];
  public displayedColumns : string[] = [];
  public appointments: Appointment[] = [];
  public isFuture : boolean = true;
  public isDone : boolean = false;
  loggedDoctor: Doctor = new Doctor()
  
  constructor(private doctorAppointmentService: DoctorAppointmentService, public dialog: MatDialog, private router: Router, private readonly doctorService: DoctorService, private reportService: ReportService) { }

  @Input() isCurrentAppointment:boolean | undefined
  
  ngOnInit(): void {
    this.doctorService.getLoggedDoctor().subscribe(res => {
      this.loggedDoctor = res
      this.changeDispledTable();
    })
  }
  ngOnChanges(): void {
    this.showCurrentAppointment();
  }

  changeDispledTable() {
    if(this.isCurrentAppointment){
      this.displayedColumns = ['time', 'doctor', 'room', 'delete'];
      this.showCurrentAppointment();
    }else{
      this.displayedColumns = ['time', 'doctor', 'room', 'delete', 'report'];
      this.showOldAppointment();
    }
  }

  public showCurrentAppointment(): void {
    this.isFuture = true;
    this.isDone = false;
    this.doctorAppointmentService.getDoctorsCurrentAppointments(this.loggedDoctor.id).subscribe(res => {
      this.appointments = res;
      this.dataSource = this.appointments;
    })
  }

  public showOldAppointment(): void {
    this.isFuture = false;
    this.isDone = true;
    this.doctorAppointmentService.getDoctorsOldAppointments(this.loggedDoctor.id).subscribe(res => {
      this.appointments = res;
      this.dataSource = this.appointments;
    })
  }

  createReport(id: string): void {
    this.reportService.getReports().subscribe(res => {
      if (res.filter(report => report.medicalAppointmentId === id).length > 0){
        alert('Ovaj termin već ima izveštaj')
      }
      else {
        localStorage.setItem('selectedAppointment', id)
        this.router.navigateByUrl('/doctor/report/new')
      }
    })
  }

  openEditDialog(id:number): void {
    const dialogRef = this.dialog.open(AddOrEditAppointmentDialogComponent, {
      data: {isAdd: false,
            appointmentId: id},
      height: '400px',
      width: '600px',
      //data: {name: this.name, animal: this.animal},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.showCurrentAppointment();
    });
  }

  openDeleteDialog(id:number): void {
    const dialogRef = this.dialog.open(CancelAppointmentDialogComponent, {
      data: {appointmentId: id},
      height: '200px',
      width: '400px',
      //data: {name: this.name, animal: this.animal},
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');
      //this.animal = result;
      this.showCurrentAppointment();
    });
  }
}
