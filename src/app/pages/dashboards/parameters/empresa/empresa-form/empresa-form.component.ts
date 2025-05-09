import { Component, NgModule, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralModule } from 'src/app/general/general.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatatableParameter } from '../../../../../admin/datatable.parameters';
import { HelperService, Messages, MessageType } from 'src/app/admin/helper.service';
import { GeneralParameterService } from '../../../../../generic/general.service';
import { DataSelectDto } from '../../../../../generic/dataSelectDto';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { fetchCrmDealSuccess } from 'src/app/store/CRM/crm_action';

@Component({
  selector: 'app-empresa-form',
  standalone: false,
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.css',
})
export class EmpresaFormComponent implements OnInit {
  img = '../../../../../../assets/no-photo.jpg';
  dataArchivo: any = undefined;
  frmEmpresas: FormGroup;
  statusForm: boolean = true;
  id!: number;
  botones = ['btn-guardar', 'btn-cancelar'];
  title = 'Crear Empresa';
  listCiudades = signal<DataSelectDto[]>([]);
  listConvenios = signal<DataSelectDto[]>([]);
  ListEnfasisSectorial: any[] = [];
  public ListTipoIdentificacion: any[] = [];
  visibleInput = false;

  breadcrumb = [
    { name: `Inicio`, icon: `fa-duotone fa-house` },
    { name: 'Operativo', icon: 'fa-duotone fa-shop' },
    { name: 'Empresas', icon: 'fa-duotone fa-briefcase' },
    { name: 'Crear', icon: 'fa-duotone fa-octagon-plus' },
  ];

  constructor(
    public routerActive: ActivatedRoute,
    private service: GeneralParameterService,
    private helperService: HelperService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.frmEmpresas = new FormGroup({
      RazonSocial: new FormControl(null, [Validators.required]),

      NombreDelAdministradorContraCaídas: new FormControl(""),
      EnfasisDecapacitacion: new FormControl(""),

      ContraCaídas: new FormControl(false),

      Nit: new FormControl(null, [
        Validators.required,
        Validators.maxLength(20),
      ]),
      Direccion: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
      ]),
      Telefono: new FormControl(0, [
        Validators.required,
        Validators.maxLength(100),
      ]),
      Email: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
      ]),
      Web: new FormControl(''),
      CiudadId: new FormControl(null, Validators.required),
      ConvenioId: new FormControl(null),
      Activo: new FormControl(true, Validators.required),
      //add new atributes
      NombreRepresentante: new FormControl(null, Validators.required),
      NumeroIndentificacion: new FormControl(null, Validators.required),
      TipoDocumentoRepresentante: new FormControl(null, Validators.required),
      
    });
    this.routerActive.params.subscribe((l) => (this.id = l['id']));
  }

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarConvenios();
    this.CargarEnum('ListEnfasisSectorial');
     this.ListTipoIdentificacion = [
      { id: 'CC', textoMostrar: 'Cedula de Ciudadania' },
      { id: 'CE', textoMostrar: 'Cedula Extranjeria' },
      { id: 'PPT', textoMostrar: 'Permiso Protección Temporal' },
      { id: 'PE', textoMostrar: 'Permiso Especial Permanencia' },
      { id: 'PP', textoMostrar: 'Pasaporte' },

   ];


    if (this.id != undefined && this.id != null) {
      this.title = 'Editar Empresa';
      this.breadcrumb = [
        { name: `Inicio`, icon: `fa-duotone fa-house` },
        { name: 'Operativo', icon: 'fa-duotone fa-shop' },
        { name: 'Empresas', icon: 'fa-duotone fa-briefcase' },
        { name: 'Editar', icon: 'fa-duotone fa-pen-to-square' },
      ];
      this.service.getById('Empresa', this.id).subscribe((l) => {
        this.frmEmpresas.controls['RazonSocial'].setValue(l.data.razonSocial);
        this.frmEmpresas.controls['Nit'].setValue(l.data.nit);
        this.frmEmpresas.controls['Direccion'].setValue(l.data.direccion);
        this.frmEmpresas.controls['Telefono'].setValue(l.data.telefono);
        this.frmEmpresas.controls['Email'].setValue(l.data.email);
        this.frmEmpresas.controls['Web'].setValue(l.data.web);
        this.frmEmpresas.controls['CiudadId'].setValue(l.data.ciudadId);
        this.frmEmpresas.controls['ConvenioId'].setValue(l.data.convenioId);
        this.frmEmpresas.controls['Activo'].setValue(l.data.activo);
        this.frmEmpresas.controls['NombreDelAdministradorContraCaídas'].setValue(l.data.nombreDelAdministradorContraCaídas);
        // this.frmEmpresas.controls['EnfasisDecapacitacion'].setValue(l.data.enfasisDecapacitacion);
        this.frmEmpresas.controls['ContraCaídas'].setValue(l.data.contraCaídas);
        this.frmEmpresas.controls['TipoDocumentoRepresentante'].setValue(l.data.tipoDocumentoRepresentante);

        if (l.data.contraCaídas) {
          this.visibleInput = true;
          this.ModificData(true);
        };
        if (l.data.contraCaídas == false) {
          this.visibleInput = false;
          this.ModificData(false);
        }
        if(l.data.contraCaídas){
            const enfasisDecapacitacionSeleccionados = l.data.enfasisDecapacitacion.split(', ');
          const diasIds = enfasisDecapacitacionSeleccionados.map((nombre: string) => {
            return this.ListEnfasisSectorial.find((d) => d.nombre === nombre)?.nombre;
          });
        this.frmEmpresas.get('EnfasisDecapacitacion')?.setValue(diasIds);
        }
        

        this.frmEmpresas.controls['NombreRepresentante'].setValue(l.data.nombreRepresentante);
        this.frmEmpresas.controls['NumeroIndentificacion'].setValue(l.data.numeroIndentificacion);

        //Consulto el archivo
        var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.foreignKey = this.id; data.nameForeignKey = 'TablaId';
        this.service.datatableKey('Archivo', data).subscribe((response) => {
          if (response.data.length > 0) {
            response.data.forEach((item: any) => {
              if (item.tabla == 'Empresas') {
                this.img = item.content;
              }
            });
          }
        });
      });
    }
  }
  CargarEnum(parametro: string) {
    this.helperService.getEnum(parametro, "description", "description").then((res) => {
      if (parametro === 'ListEnfasisSectorial') {
        // Transformar los datos al formato requerido por ng-select
        this.ListEnfasisSectorial = res;
      }
    });
  }


  ModificData(newValue: boolean): void {
    console.log('Nuevo estado del switch:', newValue);

    // Actualiza el estado de visibleInput basado en el valor emitido
    this.visibleInput = newValue;
    
    if (newValue) {
      const NombreDelAdministradorContraCaídas = this.frmEmpresas.get('NombreDelAdministradorContraCaídas');
      if (NombreDelAdministradorContraCaídas) {
        // Añadir Validators.required
        NombreDelAdministradorContraCaídas.setValidators([Validators.required]);
        // Actualizar el estado del control
        NombreDelAdministradorContraCaídas.updateValueAndValidity();
      }


      const EnfasisDecapacitacion = this.frmEmpresas.get('EnfasisDecapacitacion');
      if (EnfasisDecapacitacion) {
        // Añadir Validators.required
        EnfasisDecapacitacion.setValidators([Validators.required]);
        // Actualizar el estado del control
        EnfasisDecapacitacion.updateValueAndValidity();
      }
    }
    else {
      const NombreDelAdministradorContraCaídas = this.frmEmpresas.get('NombreDelAdministradorContraCaídas');
      if (NombreDelAdministradorContraCaídas) {
        // Añadir Validators.required
        NombreDelAdministradorContraCaídas.setValidators([]);
        // Actualizar el estado del control
        this.frmEmpresas.get('NombreDelAdministradorContraCaídas')?.setValue("");
        NombreDelAdministradorContraCaídas.updateValueAndValidity();
      }


      const EnfasisDecapacitacion = this.frmEmpresas.get('EnfasisDecapacitacion');
      if (EnfasisDecapacitacion) {
        // Añadir Validators.required
        EnfasisDecapacitacion.setValidators([]);
        // Actualizar el estado del control
        this.frmEmpresas.get('EnfasisDecapacitacion')?.setValue("");
        EnfasisDecapacitacion.updateValueAndValidity();
      }
    }

  }







  cargarCiudades() {
    this.service.getAll('Ciudad').subscribe((res) => {
      res.data.forEach((item: any) => {
        this.listCiudades.update((listCiudades) => {
          const DataSelectDto: DataSelectDto = {
            id: item.id,
            textoMostrar: `${item.codigo} - ${item.nombre}`,
            activo: item.activo,
          };

          return [...listCiudades, DataSelectDto];
        });
      });
    });
  }

  cargarConvenios() {
    this.service.getAll('Convenio').subscribe((res) => {
      res.data.forEach((item: any) => {
        this.listConvenios.update((listConvenios) => {
          const DataSelectDto: DataSelectDto = {
            id: item.id,
            textoMostrar: `${item.codigo} - ${item.nombre} - ${item.valor} %`,
            activo: item.activo,
          };

          return [...listConvenios, DataSelectDto];
        });
      });
    });
  }

  save() {
    if (this.frmEmpresas.invalid) {
      this.statusForm = false;
      this.helperService.showMessage(MessageType.WARNING, Messages.EMPTYFIELD);
      return;
    }




    this.helperService.showLoading();
    if (this.id != undefined && this.id != null) {
      var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.foreignKey = this.id; data.nameForeignKey = 'TablaId';

      if (this.dataArchivo != undefined) {
        this.dataArchivo.TablaId = this.id;
        this.dataArchivo.Nombre = 'LogoEmpresa';
        this.service.datatableKey('Archivo', data).subscribe((res) => {
          if (res.data.length > 0) {
            res.data.forEach((item: any) => {
              if (item.tabla == 'Empresas') {
                // Eliminar imagenes exixtente
                this.service.delete('Archivo', item.id).subscribe(() => { });
              }
            });
          }
        });
        this.guardarEmpresa(false, true);
      } else {
        this.guardarEmpresa(false, false);
      }
    } else {
      if (this.dataArchivo != undefined) {
        this.guardarEmpresa(true, true);
      } else {
        this.guardarEmpresa(false, false);
      }
    }
  }

  guardarEmpresa(nuevo: boolean, imagen: boolean) {
    this.frmEmpresas.controls['Telefono'].setValue(this.frmEmpresas.controls['Telefono'].value.toString());

    
    if(this.frmEmpresas.get('ContraCaídas')?.value ==true){
      const valores = this.frmEmpresas.get('EnfasisDecapacitacion')?.value.join(', ');
      this.frmEmpresas.get('EnfasisDecapacitacion')?.setValue(valores);
    }

    let data = {
      id: this.id ?? 0,
      ...this.frmEmpresas.value,
    };

    this.service.save('Empresa', this.id, data).subscribe(
      (response) => {
        if (response.status) {
          setTimeout(() => {
            this.helperService.hideLoading();
          }, 200);
          this.helperService.showMessage(
            MessageType.SUCCESS,
            Messages.SAVESUCCESS
          );
          if (imagen) {
            if (nuevo) {
              this.dataArchivo.TablaId = response.data.id;
              this.dataArchivo.Nombre = 'LogoEmpresa';
            }
            this.guardarImagen();
          } else {
            var ruta: string[] = this.router.url.toString().split('/');

            if (ruta[3] != 'empresa') {
              this.modalService.dismissAll();
            } else {
              this.helperService.redirectApp(`dashboard/operativo/empresa`);
            }
          }
        } else {
          setTimeout(() => {
            this.helperService.hideLoading();
          }, 200);
        }
      },
      (error) => {
     
          // Si el status es falso o no hay datos, mostramos el mensaje de error
     
        setTimeout(() => {
          this.helperService.hideLoading();
        }, 200);
        this.helperService.showMessage(MessageType.ERROR, error);
      }
    );
  }

  guardarImagen() {
    this.service.save('Archivo', 0, this.dataArchivo).subscribe(
      (response) => {
        if (response.status) {
          var ruta: string[] = this.router.url.toString().split('/');

          if (ruta[3] != 'empresa') {
            this.modalService.dismissAll();
          } else {
            this.helperService.redirectApp(`dashboard/operativo/empresa`);
          }
        }
      },
      (error) => {
        this.helperService.showMessage(MessageType.ERROR, error);
      }
    );
  }

  cancel() {
    var ruta: string[] = this.router.url.toString().split('/');
    if (ruta[3] != 'empresa') {
      this.modalService.dismissAll();
    } else {
      this.helperService.redirectApp('dashboard/operativo/empresa');
    }
  }

  fileEvent(event: any) {
    let archivo: any;
    let type = event.target.files[0].type.split('/')[1];

    let { name } = event.target.files[0];
    if (type == 'png' || type == 'jpeg' || type == 'jpg') {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = async (e: any) => {
        archivo = await e.target.result; //imagen en base 64
        this.dataArchivo = {
          Nombre: name,
          TablaId: 1,
          Tabla: 'Empresas',
          Extension: type,
          Content: archivo,
          Activo: true,
        };
        this.img = archivo;
      };
    }
  }
}

@NgModule({
  declarations: [EmpresaFormComponent],
  imports: [CommonModule, GeneralModule, NgbNavModule],
})
export class EmpresasFormModule { }
