import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GeneralParameterService } from '../generic/general.service';
import { DataSelectDto } from '../generic/dataSelectDto';
import { HelperService, Messages, MessageType } from '../admin/helper.service';
import { DatatableParameter } from '../admin/datatable.parameters';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-inscripciones',
    templateUrl: './inscripciones.component.html',
    styleUrls: ['./inscripciones.component.css']
})

/**
 * Inscripciones Component
 */
export class InscripcionesComponent implements OnInit {
    currentSection = 'inscripcion';
    isUsenOtherLevelEducative = false;
    isCollapsed = true;
    year: number = new Date().getFullYear();
    frmInscripcion: FormGroup;
    statusForm: boolean = true
    key: string = "Ciudad";
    lista: any[] = [];
    listGeneros: any[] = [];
    listArl = signal<DataSelectDto[]>([]);
    listEmpresas = signal<DataSelectDto[]>([]);
    listCiudades = signal<DataSelectDto[]>([]);
    listaRh: any[] = [{ nombre: 'A+' }, { nombre: 'A-' }, { nombre: 'B+' }, { nombre: 'B-' }, { nombre: 'AB+' }, { nombre: 'AB-' }, { nombre: 'O+' }, { nombre: 'O-' }];
    listaLectoEscritura: any[] = [{ nombre: 'Bueno' }, { nombre: 'Regular' }, { nombre: 'No escribe' }];
    ListlevelReading : any []=[ {nombre: 'Bueno' }, { nombre: 'Regular' }, { nombre: 'No lee' }];
    listaTipoCliente: any[] = [{ nombre: 'INDEPENDIENTE' }];
    
    ListTipoIdentificacion: any[] = [];
    listNivelEducativo: any[] = [];
    ListSectorEducative: any[] = [];
    ListCountry: any[] = [];
    LisGender: any[]=[];

    listCursos = signal<DataSelectDto[]>([]);
    listCursosDetalles = signal<DataSelectDto[]>([]);
    curso = false;
    cursoDetalle = false;
    manejoDeCertificadoEntrenamiento = false;
    precio = "0";

    contentDocumento: string = "";
    contentSoporte: string = "";
    CopiaRutEmpresa:string = "";
    contentCertificadoAptitudMedica: string = "";
    CertificadoCapacitacionEntrenamiento:string = "";
    CopiaSeguridadSocialOARl: string = "";

    constructor(
        private service: GeneralParameterService,
        private helperService: HelperService,
    ) {
        this.frmInscripcion = new FormGroup({
            Documento: new FormControl(null, [Validators.required, Validators.maxLength(20)]),
            TipoDocumento: new FormControl(null, [Validators.required]),
            PrimerNombre: new FormControl("", [Validators.required, Validators.maxLength(100)]),
            SegundoNombre: new FormControl(""),
            PrimerApellido: new FormControl("", [Validators.required, Validators.maxLength(100)]),
            SegundoApellido: new FormControl(""),
            Email: new FormControl("", [Validators.required, Validators.email]),
            Direccion: new FormControl("", [Validators.required, Validators.maxLength(150)]),
            Telefono: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            Activo: new FormControl(true, Validators.required),
            Genero: new FormControl(null, [Validators.required]),
            CiudadId: new FormControl(""),
            Codigo: new FormControl(""),
            TipoCliente: new FormControl(null, [Validators.required]),
            NivelEducativo: new FormControl(null, [Validators.required]),
            CargoActual: new FormControl(null, [Validators.required]),
            AreaTrabajo: new FormControl(null, [Validators.required]),
            LectoEscritura: new FormControl(null, [Validators.required]),
            Rh: new FormControl(null, [Validators.required]),
            Enfermedades: new FormControl("NO REFIERE", [Validators.required]),
            Alergias: new FormControl("NO REFIERE", [Validators.required]),
            Medicamentos: new FormControl("NO REFIERE", [Validators.required]),
            Lesiones: new FormControl("NO REFIERE", [Validators.required]),
            TelefonoAcudiente: new FormControl(null, [Validators.required]),
            PersonaId: new FormControl(0, [Validators.required]),
            ArlId: new FormControl(null, [Validators.required]),
            OtherLevel: new FormControl(""),
            EmpresaId: new FormControl(null, [Validators.required]),
            CursoId: new FormControl(null, [Validators.required]),
            CursoDetalleId: new FormControl(null, [Validators.required]),
            Pago: new FormControl(""),
            CountryBirth:new FormControl("",[Validators.required]),
            //add new atribute
            SectorEducative:  new FormControl(null, [Validators.required]),
            DateBirth: new FormControl(null, [Validators.required]),

            Parentesco:new FormControl(null, [Validators.required]),
            Acudiente: new FormControl(null, [Validators.required]),
            
            DocumentoIdentidad: new FormControl(null, [Validators.required]),
            CertificadoAptitudMedica:new FormControl(null, [Validators.required]),
            CopiaSeguridadSocialOARl:new FormControl(null, [Validators.required]),
            CopiaRutEmpresa:new FormControl(null, [Validators.required]),
            LevelReading: new FormControl(null, [Validators.required]),
            CertificadoCapacitacionEntrenamiento: new FormControl(
                null,
                this.manejoDeCertificadoEntrenamiento ? [Validators.required] : []
            ),
        });
    }


    ngOnInit(): void {
        this.helperService.showLoading();
        this.cargarArl();
        this.cargarEmpresas();
        this.cargarCiudades();
        this.cargarCursos();

        this.ListTipoIdentificacion = [
            { id: 'CC', textoMostrar: 'Cedula de Ciudadania' },
            { id: 'CE', textoMostrar: 'Cedula Extranjeria' },
            { id: 'PPT', textoMostrar: 'Permiso Protección Temporal' },
            { id: 'PE', textoMostrar: 'Permiso Especial Permanencia' },
            { id: 'PP', textoMostrar: 'Pasaporte' },

            
         ];


        this.CargarEnum('ListCountry');
        this.CargarEnum('listNivelEducativo');
        this.CargarEnum('ListSectorEducative');
        this.CargarEnum('LisGender');
        this.frmInscripcion.controls["TipoCliente"].setValue("INDEPENDIENTE");
    }


    CargarEnum( parametro: string) {
        this.helperService.getEnum(parametro, "description", "description").then((res) => {
          if (parametro == 'ListCountry') {
            this.ListCountry = res;
          }else if (parametro == 'listNivelEducativo'){
            this.listNivelEducativo = res;
          }
          else if (parametro == 'ListSectorEducative'){
            this.ListSectorEducative = res;
          }
          else if (parametro == 'LisGender'){
            this.listGeneros = res;
          }
          else if (parametro == 'ListTypeDocument'){
            this.ListTipoIdentificacion = res;
          }
        });
      
    }


    cargarListaForeingKey() {
        this.service.getAll(this.key).subscribe((r) => {
            this.lista = r.data;
        });
    }

    //Function for converting lowercase to upperCase
    automaticToUperCase(event: Event, formControl: string) {
        // debugger;
        const inputElement = event.target as HTMLInputElement;
        const valueInUpperCase = inputElement.value.toUpperCase();
        inputElement.value = valueInUpperCase;

        switch (formControl) {
            case 'PrimerNombre':
                this.frmInscripcion.get('PrimerNombre')?.setValue(valueInUpperCase, { emitEvent: false });
                break;
            case 'SegundoNombre':
                this.frmInscripcion.get('SegundoNombre')?.setValue(valueInUpperCase, { emitEvent: false });
                break;
            case 'PrimerApellido':
                this.frmInscripcion.get('PrimerApellido')?.setValue(valueInUpperCase, { emitEvent: false });
                break;
            case 'SegundoApellido':
                this.frmInscripcion.get('SegundoApellido')?.setValue(valueInUpperCase, { emitEvent: false });
                break;
            default:
                break;
        }

    }

    //Function for the management of another educational level 
    levelEducative(selectValue:any){
      if(selectValue && selectValue.nombre){
        if (selectValue.nombre == 'Otro') {
            this.isUsenOtherLevelEducative = true;
        }else{
            this.isUsenOtherLevelEducative = false;
        }
      }
    }

    cargarArl() {
        this.service.getAll('Arl').subscribe((res) => {
            res.data.forEach((item: any) => {
                this.listArl.update((listArl) => {
                    const DataSelectDto: DataSelectDto = {
                        id: item.id,
                        textoMostrar: `${item.codigo} - ${item.nombre}`,
                        activo: item.activo,
                    };

                    return [...listArl, DataSelectDto];
                });
            });
        });
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

    cargarEmpresas() {
        this.service.getAll('Empresa').subscribe((res) => {
            res.data.forEach((item: any) => {

                var textoMostrar= "";
                if(item.razonSocial == "INDEPENDIENTE"){
                    textoMostrar = `${item.razonSocial}`
                }else{
                    textoMostrar = `${item.nit} - ${item.razonSocial}`
                }
                    this.listEmpresas.update(listEmpresas => {
                        const DataSelectDto: DataSelectDto = {
                            id: item.id,
                            textoMostrar: textoMostrar,
                            activo: item.activo
                        };

                        return [...listEmpresas, DataSelectDto];
                    });
            });
        });
    }

    cargarCursos() {
        this.service.getAll('Curso').subscribe((res) => {
            res.data.forEach((item: any) => {
                this.listCursos.update((listCursos) => {
                    const DataSelectDto: DataSelectDto = {
                        id: item.id,
                        textoMostrar: `${item.codigo} - ${item.nombre}`,
                        activo: item.activo,
                    };

                    return [...listCursos, DataSelectDto];
                });
            });
            setTimeout(() => {
                this.helperService.hideLoading();
            }, 200);
        });
    }

    onChangeCurso(event: any) {
        if (typeof event != "undefined") {
            this.curso = true;
            this.cargarCursoDetalle(event.id);
        } else {
            this.curso = false;
            this.listCursosDetalles = signal<DataSelectDto[]>([]);
        }
    }

    onChangeCursoDetalle(event: any) {
        if (typeof event != "undefined") {
        
            this.cursoDetalle = true;
            this.service.getById("CursoDetalle", event.id).subscribe((res: any) => {
                this.precio = this.helperService.formaterNumber(res.data.precio).toString();
                this.service.getById("Nivel", res.data.nivelId).subscribe((res: any) => { 
                    if (res.data.nombre == 'REENTRENAMIENTO SECTORIAL') {                          
                        this.manejoDeCertificadoEntrenamiento = true;
                        const certificadoControl = this.frmInscripcion.get('CertificadoCapacitacionEntrenamiento');
                        if (certificadoControl) {
                            // Añadir Validators.required
                            certificadoControl.setValidators([Validators.required]);
                            // Actualizar el estado del control
                            certificadoControl.updateValueAndValidity();
                        }
                    }
                });
                
            });
        } else {
            this.cursoDetalle = false;
        }
    }

    cargarCursoDetalle(cursoId: number) {
        this.listCursosDetalles = signal<DataSelectDto[]>([]);
        var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.foreignKey = cursoId; data.nameForeignKey = "CursoId";

        this.service.dataTableAbierto('CursoDetalle', data).subscribe((res) => {
            res.data.forEach((item: any) => {
                this.listCursosDetalles.update((listCursosDetalles) => {
                    const DataSelectDto: DataSelectDto = {
                        id: item.id,
                        textoMostrar: `${item.curso} - ${item.salon} - ${item.nivel} - ${item.jornada} - Fecha Inicio: ${this.helperService.convertDateUTCToDMA(item.fechaInicio)} `,
                        activo: item.activo,
                    };

                    return [...listCursosDetalles, DataSelectDto];
                });
            });
        });
    }

    save() {
        if (this.frmInscripcion.invalid) {
            this.statusForm = false
         
            const invalidControls = Object.keys(this.frmInscripcion.controls).filter(key => {
                return this.frmInscripcion.get(key)?.invalid;
            });

         // Mostrar un mensaje detallado con los nombres de los controles inválidos
            const invalidFields = invalidControls.join(', ');
            this.helperService.showMessage(
                MessageType.WARNING, 
                `Campos inválidos: ${invalidFields}. Por favor, verifique.`
            );
            return;
        }

        

        this.helperService.showLoading();
        this.frmInscripcion.controls['Telefono'].setValue(String(this.frmInscripcion.controls['Telefono'].value));
        this.frmInscripcion.controls['TelefonoAcudiente'].setValue(this.frmInscripcion.controls['TelefonoAcudiente'].value.toString());

        //variable for the managment the other value of educative
        var valuLevelEducative = "";
        if(this.isUsenOtherLevelEducative){
            var valueOther = this.frmInscripcion.controls["OtherLevel"].value;
            valuLevelEducative = valueOther;
        }

        let persona = {
            Id: 0,
            TipoDocumento: this.frmInscripcion.controls["TipoDocumento"].value,
            Documento: this.frmInscripcion.controls["Documento"].value,
            PrimerNombre: this.frmInscripcion.controls["PrimerNombre"].value,
            SegundoNombre: this.frmInscripcion.controls["SegundoNombre"].value,
            PrimerApellido: this.frmInscripcion.controls["PrimerApellido"].value,
            SegundoApellido: this.frmInscripcion.controls["SegundoApellido"].value,
            Direccion: this.frmInscripcion.controls["Direccion"].value,
            Telefono: this.frmInscripcion.controls["Telefono"].value,
            Email: this.frmInscripcion.controls["Email"].value,
            DateBirth:this.frmInscripcion.controls["DateBirth"].value,
            CountryBirth: this.frmInscripcion.controls["CountryBirth"].value,
            Genero: this.frmInscripcion.controls["Genero"].value,
            CiudadId: this.frmInscripcion.controls["CiudadId"].value,
            Activo: this.frmInscripcion.controls["Activo"].value,
        }
        
        let cliente = {
            Id: 0,
            LevelReadings:this.frmInscripcion.controls["LevelReading"].value,
            SectorEducatives: this.frmInscripcion.controls["SectorEducative"].value,
            Activo: this.frmInscripcion.controls["Activo"].value,
            Codigo: this.frmInscripcion.controls["Codigo"].value,
            TipoCliente: this.frmInscripcion.controls["TipoCliente"].value,
            NivelEducativo: this.isUsenOtherLevelEducative? valuLevelEducative :this.frmInscripcion.controls["NivelEducativo"].value,
            CargoActual: this.frmInscripcion.controls["CargoActual"].value,
            AreaTrabajo: this.frmInscripcion.controls["AreaTrabajo"].value,
            LectoEscritura: this.frmInscripcion.controls["LectoEscritura"].value,
            Rh: this.frmInscripcion.controls["Rh"].value,
            Enfermedades: this.frmInscripcion.controls["Enfermedades"].value,
            Alergias: this.frmInscripcion.controls["Alergias"].value,
            Medicamentos: this.frmInscripcion.controls["Medicamentos"].value,
            Lesiones: this.frmInscripcion.controls["Lesiones"].value,

            TelefonoAcudiente: this.frmInscripcion.controls["TelefonoAcudiente"].value,
            Acudiente : this.frmInscripcion.controls["Acudiente"].value,
            Parentesco : this.frmInscripcion.controls["Parentesco"].value,
            PersonaId: this.frmInscripcion.controls["PersonaId"].value,
            ArlId: this.frmInscripcion.controls["ArlId"].value,
            
            EmpresaId: this.frmInscripcion.controls["EmpresaId"].value,
        }

        this.service.save("Persona", 0, persona).subscribe(
            (response) => {
                if (response.status) {
                    cliente.PersonaId = response.data.id;

                    setTimeout(() => {
                        this.SaveCliente(cliente);
                    }, 200);
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
        );

    }

    SaveCliente(data: any) {
        let inscripcion = {
            Id: 0,
            Activo: this.frmInscripcion.controls["Activo"].value,
            CursoDetalleId: this.frmInscripcion.controls["CursoDetalleId"].value,
            ClienteId: 0,
            UsuarioRegistro: "",
        }

        this.service.save('Cliente', 0, data).subscribe(
            (response) => {
                if (response.status) {
                    inscripcion.ClienteId = response.data.id;

                    setTimeout(() => {
                        this.SaveInscripcion(inscripcion);
                    }, 200);
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
        );
    }

    SaveInscripcion(data: any) {
        this.service.save('Inscripcion', 0, data).subscribe(
            (response) => {
                if (response.status) {
                    this.SaveArchivo(data.ClienteId);
                    this.helperService.showMessage(
                        MessageType.SUCCESS,
                        Messages.SAVESUCCESS
                    );
                    setTimeout(() => {
                        this.helperService.hideLoading();
                    }, 200);
                    this.frmInscripcion.reset();
                    this.curso = false;
                    this.listCursosDetalles = signal<DataSelectDto[]>([]);
                }
            },
            (error) => {
                setTimeout(() => {
                    this.helperService.hideLoading();
                }, 200);
                this.helperService.showMessage(MessageType.WARNING, error);
            }
        );
    }

    SaveArchivo(clienteId: number) {
        let data = {
            Nombre: "",
            TablaId: clienteId,
            Tabla: 'Clientes',
            Extension: "pdf",
            Content: "",
            Activo: true,
        };

        //Guardo el documento de identidad
        data.Nombre = "Documento de Identidad";
        data.Content = this.contentDocumento;
        this.service.save("Archivo", 0, data).subscribe((res: any) => {
            if (res.status) {
                console.log("Documento de identidad guardado correctamente.");
            } else {
                console.log("Error al guardar el documento de identidad.");
            }
        });
        
        if(this.contentSoporte !=null){
            //Guardo el documento de la eps
            data.Nombre = "Soporte de Pago";
            data.Content = this.contentSoporte;
            data.Extension = "jpg";
            this.service.save("Archivo", 0, data).subscribe((res: any) => {
                if (res.status) {
                    console.log("Soporte de pago guardado correctamente");
                } else {
                    console.log("Error al guardar el soporte de pago");
                }
            });  
        }

        //Guardo la copia del certificado en la aptitud medica
        data.Nombre = "Copia del certificado de Aptitud";
        data.Content = this.contentCertificadoAptitudMedica;
        data.Extension = "pdf";
        this.service.save("Archivo", 0, data).subscribe((res: any) => {
            if (res.status) {
                console.log("Soporte de pago guardado correctamente");
            } else {
                console.log("Error al guardar el soporte de pago");
            }
        });

         //Guardo la copia del runt
         data.Nombre = "Soporte del Runt de la empresa";
         data.Content = this.CopiaRutEmpresa;
         data.Extension = "pdf";
         this.service.save("Archivo", 0, data).subscribe((res: any) => {
             if (res.status) {
                 console.log("Soporte de pago guardado correctamente");
             } else {
                 console.log("Error al guardar el soporte de pago");
             }
         });

         //Guardo la copia del Ultimo Pago de Seguridad Social Vigente
         data.Nombre = "Ultimo Pago de Seguridad Social Vigente o Arl";
         data.Content = this.CopiaSeguridadSocialOARl;
         data.Extension = "pdf";
         this.service.save("Archivo", 0, data).subscribe((res: any) => {
             if (res.status) {
                 console.log("Soporte de pago guardado correctamente");
             } else {
                 console.log("Error al guardar el soporte de pago");
             }
         });

         //Guardo la copia del copia del certificado del proceso
         data.Nombre = "Soporte certificado del proceso de capacitacion";
         data.Content = this.CertificadoCapacitacionEntrenamiento;
         data.Extension = "pdf";
         this.service.save("Archivo", 0, data).subscribe((res: any) => {
             if (res.status) {
                 console.log("Soporte de pago guardado correctamente");
             } else {
                 console.log("Error al guardar el soporte de pago");
             }
         });
    }

    convertToBase64(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    }

    //Events Input


    onChangeDocumentos(event: any, document : string) {
        if (typeof event != "undefined") {
            const file: File = event.target.files[0];
            this.convertToBase64(file).then((base64Content: string) => {
                switch (document) {
                    case 'DocumentoIdentidad':
                        this.contentDocumento = base64Content;
                        break;
                    case 'Pago':
                        this.contentSoporte = base64Content;
                        break;
                    case 'CertificadoAptitudMedica':
                        this.contentCertificadoAptitudMedica = base64Content;
                        break;
                    case 'CopiaRutEmpresa':
                        this.CopiaRutEmpresa = base64Content;
                        break;
                    case 'CertificadoCapacitacionEntrenamiento':
                        this.CertificadoCapacitacionEntrenamiento = base64Content;
                        break;
                    case 'CopiaSeguridadSocialOARl':
                        this.CopiaSeguridadSocialOARl = base64Content;
                        break;    
                    default:
                        break;
                }
            }).catch((error: any) => {
                this.helperService.showMessage(MessageType.ERROR, error);
            });
        }
    }

    CertificadoBancario() {
        Swal.fire(`<h2>Datos Bancarios</h2>
                    <h5>SAFETY, HEALTH AND WORK RISK CONSULTANTS</h5>
                    <h5>NIT: 901202775</h5>
                    <h5>BANCOLOMBIA</h5>
                    <h5>CUENTA DE AHORROS</h5>
                    <h5>No. Producto: 74100008650</h5>`);
    }

    //PAGE
    /**
    * Section changed method
    * @param sectionId specify the current sectionID
    */
    onSectionChange(sectionId: string) {
        this.currentSection = sectionId;
    }

    /**
      * Window scroll method
      */
    // tslint:disable-next-line: typedef
    windowScroll() {
        const navbar = document.getElementById('navbar');
        if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
            navbar?.classList.add('is-sticky');
        }
        else {
            navbar?.classList.remove('is-sticky');
        }

        // Top Btn Set
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            (document.getElementById("back-to-top") as HTMLElement).style.display = "block"
        } else {
            (document.getElementById("back-to-top") as HTMLElement).style.display = "none"
        }
    }

    // When the user clicks on the button, scroll to the top of the document
    topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
}