import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { Building } from 'src/app/modules/maps/models/building.model';
import { Floor } from 'src/app/modules/maps/models/floor.model';
import { Room } from 'src/app/modules/shared/model/room.model';
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

  public buildings : Building[] = [];
  public floors : Floor[] = []
  public rooms : Room[] = []

  selectedRoom1: BehaviorSubject<Room> = new BehaviorSubject(new Room);
  selectedRoom2: BehaviorSubject<Room> = new BehaviorSubject(new Room);

  firstStepFormGroup!: FormGroup;
  secondStepFormGroup!: FormGroup;
  thirdStepFormGroup!: FormGroup;
  forthStepFormGroup!: FormGroup;
  fifthStepFormGroup!: FormGroup;

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
      typeOfRenovation: ['', [Validators.required]]
    });
    this.forthStepFormGroup = this._formBuilder.group({
      typeOfRenovation: ['', [Validators.required]]
    });
    this.fifthStepFormGroup = this._formBuilder.group({
      typeOfRenovation: ['', [Validators.required]]
    });
    
  }

  public changeRenovationMethod() {
    if (this.renovation.Type.toString() != this.firstStepFormGroup.value.typeOfRenovation) {
      this.renovation.Type = this.firstStepFormGroup.value.typeOfRenovation
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
      this.setRoomValidationCheck();
  }

  loadRooms() {
    this.facade.getRoomsByFloorId$(this.secondStepFormGroup.value.floorControl).subscribe({
      next: (v) => this.rooms = v
    })
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
    }
    else{
      this.secondStepFormGroup.controls['room2Control'].clearValidators();
      this.secondStepFormGroup.controls['room2Control'].updateValueAndValidity();
    }
  }

  logs() {
    console.log(this.secondStepFormGroup.value)
  }
      
}
