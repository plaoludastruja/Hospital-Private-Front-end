import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { BehaviorSubject, Observable } from 'rxjs';
import { Building } from 'src/app/modules/maps/models/building.model';
import { Floor } from 'src/app/modules/maps/models/floor.model';
import { Room } from 'src/app/modules/shared/model/room.model';
import { RenovationDto } from '../../models/renovation-dto.model';
import { RenovationSessionWDates } from '../../models/renovation-session-with-dates';
import { RenovationSessionWId } from '../../models/renovation-session-with-id';
import { RenovationSessionWRooms } from '../../models/renovation-session-with-rooms';
import { RenovationSessionWType } from '../../models/renovation-session-with-type';
import { Renovation, TypeOfRenovation } from '../../models/renovation.model';
import { RoomRenovationFacade } from '../../room-renovation.facade';

@Component({
  selector: 'app-room-renovation',
  templateUrl: './room-renovation.component.html',
  styleUrls: ['./room-renovation.component.css']
})
export class RoomRenovationComponent implements OnInit {
  public renovation : Renovation = new Renovation();
  public choices = TypeOfRenovation;

  public rootId : String = "";

  public buildings : Building[] = [];
  public floors : Floor[] = []
  public rooms : Room[] = []

  selectedRoom1: BehaviorSubject<Room> = new BehaviorSubject(new Room);
  selectedRoom2: BehaviorSubject<Room> = new BehaviorSubject(new Room);

  dates: Date[] = [];

  firstStepFormGroup!: FormGroup;
  secondStepFormGroup!: FormGroup;
  thirdStepFormGroup!: FormGroup;
  forthStepFormGroup!: FormGroup;
  fifthStepFormGroup!: FormGroup;
  minDate : Date = new Date(new Date().getFullYear(),new Date().getMonth(), new Date().getDate() + 2);

  constructor(private facade : RoomRenovationFacade, private _formBuilder: FormBuilder) {
      // Gets all buildings at start
      this.facade.getBuildings$().subscribe({
        next: (v) => this.buildings = v
      }) 
  }

  ngOnInit() {
    this.firstStepFormGroup = this._formBuilder.group({
      typeOfRenovation: ['', [Validators.required]]
    });
    this.secondStepFormGroup = this._formBuilder.group({
      buildingControl : ['', [Validators.required]],
      floorControl : ['', [Validators.required]],
      room1Control : ['', [Validators.required]],
      room2Control : ['']
    });
    this.thirdStepFormGroup = this._formBuilder.group({
      dateControl: ['', [Validators.required]],
      daysControl: ['', [
        Validators.required,
        Validators.pattern('[0-9]+'),
      ]],
      hoursControl: ['', [
        Validators.required,
        Validators.pattern('[0-9]+'),
      ]],
      minutesControl: ['', [
        Validators.required,
        Validators.pattern('[0-9]+'),
      ]]
    });
    this.forthStepFormGroup = this._formBuilder.group({
      selectedDate: ['', [Validators.required]],
    });
    this.fifthStepFormGroup = this._formBuilder.group({
      name1: ['', [Validators.required]],
      description1: ['', [Validators.required]],
      number1: ['', [
        Validators.required,
        Validators.pattern('[0-9]+')]],

      name2: ['', []],
      description2: ['', []],
      number2: ['', []]
    });
    
    
  }

  public changeRenovationMethod(stepper : MatStepper) {
    if (this.renovation.Type.toString() != this.firstStepFormGroup.value.typeOfRenovation) {
      this.renovation.Type = this.firstStepFormGroup.value.typeOfRenovation
      var i = 0;
      stepper.steps.forEach(element => {
        if (i != 0) {
          element.reset()
        }
        i++;
      });
      this.secondStepFormGroup.reset()
      this.floors = []
      this.rooms = []
      this.selectedRoom1.next(new Room());
      this.selectedRoom2.next(new Room());
    }
  }

  loadFloors() {
      this.facade.getFloorsByBuildingId$(this.secondStepFormGroup.value.buildingControl).subscribe({
        next: (v) => this.floors = v
      })
      this.renovation.buildingId = this.secondStepFormGroup.value.buildingControl;
      this.setRoomValidationCheck();
  }

  loadRooms() {
    this.facade.getRoomsByFloorId$(this.secondStepFormGroup.value.floorControl).subscribe({
      next: (v) => this.rooms = v
    })
    this.renovation.floodId = this.secondStepFormGroup.value.floorControl
  }

  setRenovationRoom1() {
    this.renovation.Room1 = this.secondStepFormGroup.value.room1Control;
    this.selectedRoom1.next(this.renovation.Room1);
  }

  setRenovationRoom2() {
    this.renovation.Room2 = this.secondStepFormGroup.value.room2Control;
    this.selectedRoom2.next(this.renovation.Room2);
  }
    

  setRoomValidationCheck() {
    if (this.renovation.Type == 'Merge') {
      this.secondStepFormGroup.controls['room2Control'].setValue('');
      this.secondStepFormGroup.controls['room2Control'].setValidators(Validators.required)
      this.secondStepFormGroup.controls['room2Control'].updateValueAndValidity();

      this.fifthStepFormGroup.controls['name2'].clearValidators();
      this.fifthStepFormGroup.controls['description2'].clearValidators();
      this.fifthStepFormGroup.controls['number2'].clearValidators();
      this.fifthStepFormGroup.controls['name2'].updateValueAndValidity();
      this.fifthStepFormGroup.controls['description2'].updateValueAndValidity();
      this.fifthStepFormGroup.controls['number2'].updateValueAndValidity();
    }
    else{
      this.secondStepFormGroup.controls['room2Control'].clearValidators();
      this.secondStepFormGroup.controls['room2Control'].updateValueAndValidity();

      this.fifthStepFormGroup.controls['name2'].setValidators(Validators.required)
      this.fifthStepFormGroup.controls['description2'].setValidators(Validators.required)
      this.fifthStepFormGroup.controls['number2'].setValidators(Validators.required)
      this.fifthStepFormGroup.controls['name2'].updateValueAndValidity();
      this.fifthStepFormGroup.controls['description2'].updateValueAndValidity();
      this.fifthStepFormGroup.controls['number2'].updateValueAndValidity();
    }
  }

  checkNewData(stepper : MatStepper) {
    if (this.renovation.Type == 'Merge') {
      var room : Room = new Room();
      room.name = this.fifthStepFormGroup.value.name1
      room.description = this.fifthStepFormGroup.value.description1
      room.number = this.fifthStepFormGroup.value.number1
      this.renovation.Room3 = room
    }
    else{
      var room : Room = new Room();
      room.name = this.fifthStepFormGroup.value.name1
      room.description = this.fifthStepFormGroup.value.description1
      room.number = this.fifthStepFormGroup.value.number1
      this.renovation.Room2 = room

      var room : Room = new Room();
      room.name = this.fifthStepFormGroup.value.name2
      room.description = this.fifthStepFormGroup.value.description2
      room.number = this.fifthStepFormGroup.value.number2
      this.renovation.Room3 = room
    }
    if(this.fifthStepFormGroup.valid) {
      var input = new RenovationSessionWRooms();
      
      if(this.renovation.Type == 'Split') {
        input.RoomPlans.push(this.renovation.Room2);
      }
      input.RoomPlans.push(this.renovation.Room3);
      input.AggregateId = this.rootId;
      this.facade.createNewRooms$(input).subscribe({
        complete: () => stepper.next()
      })
    }
  }

  recommendRenovation(stepper : MatStepper) {
    if(!this.thirdStepFormGroup.hasError('required')) {
      this.renovation.Duration = 0;
      this.renovation.Duration += this.thirdStepFormGroup.value.daysControl * 60 * 24;
      this.renovation.Duration += this.thirdStepFormGroup.value.hoursControl * 60;
      this.renovation.Duration += this.thirdStepFormGroup.value.minutesControl;
    }
    if(this.renovation.Duration >= 0 && this.thirdStepFormGroup.value.dateControl != '') {
      this.recommendDate(stepper);
    }
    else {
      alert("Please enter a valid duration")
    }
  }

  recommendDate(stepper : MatStepper){
    var formattedDate = this.dateAsYYYYMMDDHHNNSS(this.thirdStepFormGroup.value.dateControl);
    if(this.renovation.Type == 'Split') {
      this.selectedRoom2 = this.selectedRoom1;
    }
    this.facade.getAllRecommendations$(formattedDate, this.renovation.Duration, this.selectedRoom1.value.id, this.selectedRoom2.value.id).subscribe({
      next: (v) => {
        this.dates = v;
      },
      complete: () => {
        var input = new RenovationSessionWDates();
        input.AggregateId = this.rootId;
        input.Start = new Date(formattedDate);
        input.End = new Date(formattedDate);
        input.End.setMinutes(input.End.getMinutes() + this.renovation.Duration);
        this.facade.createTimeframe$(input).subscribe({
          complete: () => stepper.next()
        })
      } 
    });
  }

  // https://stackoverflow.com/questions/40526102/how-do-you-format-a-date-time-in-typescript
  dateAsYYYYMMDDHHNNSS(date:any): string {
    return date.getFullYear()
              + '-' + this.leftpad(date.getMonth() + 1)
              + '-' + this.leftpad(date.getDate())
              + 'T' + this.leftpad(date.getHours())
              + ':' + this.leftpad(date.getMinutes())
              + ':' + this.leftpad(date.getSeconds());
  }
  leftpad(val:any, resultLength = 2, leftpadChar = '0'): string {
    return (String(leftpadChar).repeat(resultLength)
          + String(val)).slice(String(val).length);
  }

  checkRoomsAndReport(stepper : MatStepper) {
    if(this.renovation.Type == 'Merge') {
      this.facade.checkIfRoomsAreAdjacent$(this.selectedRoom1.value.id,this.selectedRoom2.value.id).subscribe({
        next: (v) => {
          if(v == true) {
            var input = new RenovationSessionWRooms();
            
            var room1 = new Room();
            room1.id = this.selectedRoom1.value.id;
            var room2 = new Room();
            room2.id = this.selectedRoom2.value.id;


            input.RoomPlans.push(room1);
            input.RoomPlans.push(room2);
            input.AggregateId = this.rootId;

            this.facade.chooseOldRooms$(input).subscribe({
              complete : () => stepper.next()
            });
          }
          else {
            alert("Rooms are not adjacent");
          }
        }
  
      })  
    }
    else {
      var input = new RenovationSessionWRooms();
      var room1 = new Room();
      room1.id = this.selectedRoom1.value.id;

      input.RoomPlans.push(room1);
      input.AggregateId = this.rootId;

      this.facade.chooseOldRooms$(input).subscribe({
        complete : () => stepper.next()
      });
    }
  }

  finish() {
    var input = new RenovationSessionWId();
    input.AggregateId = this.rootId;
    this.facade.endSession$(input).subscribe({
      complete : () => location.reload()
    })
  }

  logs() {
    console.log(this.secondStepFormGroup.value)
  }

  // Event sourcing
  chooseType(stepper : MatStepper) {
    this.facade.startSession$().subscribe({
      next: (v) => {
        this.rootId = v;
      },
      complete: () => {
        var input = new RenovationSessionWType();
        input.AggregateId = this.rootId;
        input.Type = this.renovation.Type.toString();

        this.facade.chooseType$(input).subscribe({
          complete: () => stepper.next()
        })
      }
    })
  }

  returnToTypeSelection(stepper : MatStepper) {
    var input = new RenovationSessionWId();
    input.AggregateId = this.rootId;
    this.facade.returnToTypeSelection$(input).subscribe({
      complete : () => stepper.previous()
    })
  }

  returnToOldRoomsSelection(stepper: MatStepper) {
    var input = new RenovationSessionWId();
    input.AggregateId = this.rootId;
    this.facade.returnToOldRoomsSelection$(input).subscribe({
      complete : () => stepper.previous()
    })
  }

  returnToTimeframeCreation(stepper: MatStepper) {
    var input = new RenovationSessionWId();
    input.AggregateId = this.rootId;
    this.facade.returnToTimeframeCreation$(input).subscribe({
      complete : () => stepper.previous()
    })  
  }

  chooseSpecificTime(stepper: MatStepper) {
    var input = new RenovationSessionWDates();
    input.AggregateId = this.rootId;
    input.Start = new Date(this.forthStepFormGroup.value.selectedDate);
    input.End = new Date(this.forthStepFormGroup.value.selectedDate);
    input.End.setMinutes(input.End.getMinutes() + this.renovation.Duration);
    this.facade.chooseSpecificTime$(input).subscribe({
      complete: () => stepper.next()
    })
  }

  returnToSpecificTimeSelection(stepper: MatStepper) {
    var input = new RenovationSessionWId();
    input.AggregateId = this.rootId;
    this.facade.returnToSpecificTimeSelection$(input).subscribe({
      complete : () => stepper.previous()
    })  }

  returnToNewRoomCreation(stepper: MatStepper) {
    var input = new RenovationSessionWId();
    input.AggregateId = this.rootId;
    this.facade.returnToNewRoomCreation$(input).subscribe({
      complete : () => stepper.previous()
    })
  }
      
}
