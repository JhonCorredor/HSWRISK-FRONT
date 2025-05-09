import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralModule } from 'src/app/general/general.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService, Messages, MessageType } from 'src/app/admin/helper.service';
import { GeneralParameterService } from '../../../../../generic/general.service';

@Component({
  selector: 'app-personas-form',
  standalone: false,
  templateUrl: './personas-form.component.html',
  styleUrl: './personas-form.component.css'
})
export class PersonasFormComponent implements OnInit {
  frmPersonas: FormGroup;
  statusForm: boolean = true
  id!: number;
  botones = ['btn-guardar', 'btn-cancelar'];
  titulo = "";
  serviceName: String = '';
  titleData: String = '';
  key: string = "";
  public lista: any[] = [];
  public listGeneros: any[] = [];
  public ListTipoIdentificacion: any[] = [];
  ListCountry: any[] = [];

  constructor(
    public routerActive: ActivatedRoute,
    private service: GeneralParameterService,
    private helperService: HelperService,
    private modalActive: NgbActiveModal
  ) {
    this.frmPersonas = new FormGroup({
      Documento: new FormControl(null, [Validators.required, Validators.maxLength(20)]),
      TipoDocumento: new FormControl(null, [Validators.required]),
      PrimerNombre: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      SegundoNombre: new FormControl(""),
      PrimerApellido: new FormControl("", [Validators.required, Validators.maxLength(100)]),
      SegundoApellido: new FormControl(""),
      Email: new FormControl("", [Validators.required, Validators.maxLength(50)]),
      Direccion: new FormControl("", [Validators.required, Validators.maxLength(150)]),
      Telefono: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      Activo: new FormControl(true, Validators.required),
      DateBirth:new FormControl(null, Validators.required),
      CountryBirth: new FormControl(null, Validators.required),
      Genero: new FormControl(null, [Validators.required]),
     
    });
  }

  ngOnInit(): void {
    this.CargarEnum('ListCountry');
    this.CargarEnum('LisGender')
    if (this.id != undefined && this.id != null) {
      this.titulo = `Editar ${this.titleData}`;
      this.service.getById(this.serviceName, this.id).subscribe(l => {
        this.frmPersonas.controls['Documento'].setValue(l.data.documento);
        this.frmPersonas.controls['TipoDocumento'].setValue(l.data.tipoDocumento);
        this.frmPersonas.controls['PrimerNombre'].setValue(l.data.primerNombre);
        this.frmPersonas.controls['SegundoNombre'].setValue(l.data.segundoNombre);
        this.frmPersonas.controls['PrimerApellido'].setValue(l.data.primerApellido);
        this.frmPersonas.controls['SegundoApellido'].setValue(l.data.segundoApellido);
        this.frmPersonas.controls['CountryBirth'].setValue(l.data.countryBirth);
        

        const fechaFormateada = this.helperService.formatDateToInputUpdateForm(l.data.dateBirth);
        this.frmPersonas.controls['DateBirth'].setValue(fechaFormateada);
        this.frmPersonas.controls['Email'].setValue(l.data.email);
        this.frmPersonas.controls['Direccion'].setValue(l.data.direccion);
        this.frmPersonas.controls['Telefono'].setValue(l.data.telefono);
        this.frmPersonas.controls['Activo'].setValue(l.data.activo);
        this.frmPersonas.controls['Genero'].setValue(l.data.genero);
      })
    } else {
      this.titulo = `Crear ${this.titleData}`;
    }

    this.ListTipoIdentificacion = [
      { id: 'CC', textoMostrar: 'Cedula de Ciudadania' },
      { id: 'CE', textoMostrar: 'Cedula Extranjeria' },
      { id: 'PPT', textoMostrar: 'Permiso Protección Temporal' },
      { id: 'PE', textoMostrar: 'Permiso Especial Permanencia' },
      { id: 'PP', textoMostrar: 'Pasaporte' },      
   ];

    this.cargarListaForeingKey();

  }



  CargarEnum( parametro: string) {
    this.helperService.getEnum(parametro, "description", "description").then((res) => {
      if (parametro == 'ListCountry') {
        this.ListCountry = res;
      }else if (parametro == 'LisGender'){
        this.listGeneros = res;
      }
      
    });
  
}

  cargarListaForeingKey() {
    this.service.getAll(this.key).subscribe((r) => {
      this.lista = r.data;
    });
  }

  save() {
    this.frmPersonas.controls['Telefono'].setValue(String(this.frmPersonas.controls['Telefono'].value));
    if (this.frmPersonas.invalid) {
      this.statusForm = false
      this.helperService.showMessage(MessageType.WARNING, Messages.EMPTYFIELD);
      return;
    }
    this.helperService.showLoading();
    let data = {
      id: this.id ?? 0,
      // [this.key + 'Id']: this.frmPersonas.controls['Key_Id'].value,
      ...this.frmPersonas.value,
    };
    this.service.save(this.serviceName, this.id, data).subscribe(
      (response) => {
        if (response.status) {
          setTimeout(() => {
            this.helperService.hideLoading();
          }, 200);
          this.modalActive.close(true);
          this.helperService.showMessage(MessageType.SUCCESS, Messages.SAVESUCCESS);
        } else {
          setTimeout(() => {
            this.helperService.hideLoading();
          }, 200);
        }
      },
      (error) => {
        setTimeout(() => {
          this.helperService.hideLoading();
        }, 200);
        this.helperService.showMessage(MessageType.WARNING, error);
      }
    )
  }

  cancel() {
    this.modalActive.close();
  }

  toCamelCase(input: string): string {
    return input.replace(/^[A-Z]/, (match) => match.toLowerCase());
  }
}

@NgModule({
  declarations: [
    PersonasFormComponent,
  ],
  imports: [
    CommonModule,
    GeneralModule
  ]
})
export class PersonasFormModule { }