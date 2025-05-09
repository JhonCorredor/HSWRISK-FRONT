import { Component, OnInit, NgModule, ViewChild, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GeneralModule } from 'src/app/general/general.module';
import { HelperService, Messages, MessageType } from 'src/app/admin/helper.service';
import { GeneralParameterService } from '../../../../../generic/general.service';
import { DatatableParameter } from '../../../../../admin/datatable.parameters';
import { LANGUAGE_DATATABLE } from 'src/app/admin/datatable.language';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataSelectDto } from 'src/app/generic/dataSelectDto';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClientesImportComponent } from '../../../parameters/clientes/clientes-import/clientes-import.component';
import Swal from 'sweetalert2';
import { ReportExelComponent } from '../../../Additional/ReportExel/report-exel/report-exel.component';

import { Router } from '@angular/router';

@Component({
    selector: 'app-inscripciones-index',
    standalone: false,
    templateUrl: './inscripciones-index.component.html',
    styleUrl: './inscripciones-index.component.css',
})
export class InscripcionesIndexComponent implements OnInit {
    title = 'Listado de Inscripciones';
    breadcrumb!: any[];
    botones: String[] = ['btn-importar-cliente', 'btn-nuevo','btn-descargar-archivo'];
    listCursos = signal<DataSelectDto[]>([]);
    listCursosDetalles = signal<DataSelectDto[]>([]);
    curso = false;
    cursoDetalle = false;
    public dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective) dtElement!: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    frmInscripciones: FormGroup;
    statusForm: boolean = true;

     rol = localStorage.getItem("rol");
     userIdStr = localStorage.getItem("userId");
     userId = this.userIdStr ? parseInt(this.userIdStr) : 0;  

    constructor(
        private service: GeneralParameterService,
        public helperService: HelperService,
        public router: Router,
        private modalService: NgbModal,
        private datePipe: DatePipe
    ) {
        this.breadcrumb = [
            { name: `Inicio`, icon: `fa-duotone fa-house` },
            { name: 'Operativo', icon: 'fa-duotone fa-shop' },
            { name: 'Inscripciones', icon: 'fa-duotone fa-clipboard-check' },
        ];

        this.frmInscripciones = new FormGroup({
            CursoId: new FormControl(null, [Validators.required]),
            CursoDetalleId: new FormControl(null, [Validators.required]),
            FechaInicio: new FormControl(null, [Validators.required]),
            FechaFin: new FormControl(null, [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.cargarCursos();
        this.cargarLista(false);
        this.validarEmpleado().then((value: boolean)=>{
            if(!value){
                this.cargarListaAdmin();
            }         
        })
        
        
    }

    ngAfterViewInit() {
        this.dtTrigger.next(this.dtOptions);
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    validarEmpleado():Promise<boolean> {
        return new Promise((resolve,reject)=>{
            this.helperService.showLoading();
            var usuarioId = localStorage.getItem("userId");
            var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.foreignKey = Number(usuarioId); data.nameForeignKey = "UsuarioId";data.fechaFin = ""; data.fechaInicio= "";data.extra= "";
            this.service.datatableKey("UsuarioRol", data).subscribe((res: any) => {
                if (res.status) {
                    res.data.forEach((element: any) => {
                        this.service.getById("Rol", element.rolId).subscribe((roles: any) => {
                            localStorage.setItem("rol", roles.data.codigo);
                            if (roles.data.codigo == "INSTRUCTOR") {
                                //Cambiar consulta a la de instructores
                                data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.fechaInicio = ''; data.fechaFin = ''; data.foreignKey = ""; data.nameForeignKey = "";
                                data.nameForeignKey ="EmpleadoId";
                                data.foreignKey = this.userId;
                                data.fechaFin = '';
                                data.fechaInicio = '';
                                resolve(true);
                                this.cargarListaInstructores(data);
                            } else {
                                data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.fechaInicio = ''; data.fechaFin = ''; data.foreignKey = ""; data.nameForeignKey = "";
                                data.nameForeignKey ="";
                                data.foreignKey = "";
                                data.fechaFin = '';
                                data.fechaInicio = '';
                                resolve(false);
                                this.helperService.hideLoading();
                            }
                        });
                    });
                }
            });
        })
       
    }

    cargarLista(dataQuery?:any, start?:boolean) {
        var rol = localStorage.getItem("rol");
        this.dtOptions = {
            dom: 'Blfrtip',
            processing: true,
            ordering: true,
            responsive: true,
            paging: true,
            order: [0, 'desc'],
            language: LANGUAGE_DATATABLE,
            ajax: (dataTablesParameters: any, callback: any) => {
                // var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = '';
                // if(start){
                //     debugger
                //     if (dataQuery.foreignKey != null || dataQuery.nameForeignKey != null) {
                    
                //         data.nameForeignKey ="EmpleadoId";
                //         data.foreignKey = this.userId;
                //         data.fechaFin = '';
                //         data.fechaInicio = '';
        
        
                //         this.service.dataTableInstructor('Inscripcion', data).subscribe((res) => {
                //             callback({
                //                 recordsTotal: res.data.length,
                //                 recordsFiltered: res.data.length,
                //                 draw: dataTablesParameters.draw,
                //                 data: res.data,
                //             });
                //             this.helperService.hideLoading();
                //         });
                      
                //     }else{
                //         this.service.datatable('Inscripcion', data).subscribe((res) => {
                //             callback({
                //                 recordsTotal: res.data.length,
                //                 recordsFiltered: res.data.length,
                //                 draw: dataTablesParameters.draw,
                //                 data: res.data,
                //             });
                //             this.helperService.hideLoading();
                //         });
                //     }     
                // }
            },
            columns: [
                {
                    title: 'FECHA',
                    data: 'createAt',
                    className: 'text-center',
                    render: (item: any) => {
                        return this.helperService.convertDateTime(item);
                    },
                },
             
                {
                    title: 'CÓDIGO',
                    data: 'codigo',
                    className: 'text-center',
                },
                {
                    title: 'INSTRUCTOR',
                    data: 'instructor',
                    className: 'text-center',
                },  
                {
                    title: 'CLIENTE',
                    data: 'cliente',
                    className: 'text-center',
                },
                {
                    title: 'ESTADO',
                    data: 'estado',
                    className: 'text-center',
                },
                {
                    title: 'DETALLE DEL CURSO',
                    data: 'cursoDetalle',
                    className: 'text-center',
                    render: function (id: any, type: any, row: any, meta: any) {
                        // Combina cursoId y cursoDetalleId en una cadena separada por "|"
                        return ` ${row.cursoDetalle}
                        
                        <button class="btn btn-sm text-secondary btn-details" 
                                type="button" 
                                data-id="${row.cursoId}|${row.cursoDetalleId}">
                            <i class="fa-duotone fa-eye"></i> Ver Detalles
                        </button>`;
                    }
                },
                 
                {
                    title: 'FECHA DE INICIO',
                    data: 'fechaInicio',
                    className: 'text-center',
                    render: (item: any) => {
                        return this.helperService.convertDateUTCToDMA(item);
                    },
                },
                {
                    title: 'PAGO&nbsp;&nbsp;<input class="form-check-input btn-dropdown-pago-all" type="checkbox">',
                    data: 'id',
                    className: 'text-center',
                    width: '150px',
                    render: function (id: any, type: any, row: any, meta: any) {
                        return `<input class="form-check-input btn-dropdown-pago" type="checkbox" data-id="${id}" ${row.pagoValidado === false ? '' : 'checked disabled'}>`;
                    },
                },
                {
                    title: 'ACCIONES',
                    orderable: false,
                    // visible: false,
                    data: 'id',
                    className: 'text-center',
                    width: '250px',
                    render: function (id: any, type: any, row: any, meta: any) {
                        var rol = localStorage.getItem("rol");
                        var content = "";
                        if (row.estado == "APROBADO") {
                            content = `<div role="group" class="button-group" aria-label="Basic example">
                                            <div class="form-check me-2  text-center">
                                                <input class="form-check-input check-certificado" type="checkbox" data-id="${id}">
                                                <label class="form-check-label"> CERTIFICADO</label>
                                            </div>
                                       </div>`;
                        } else if (row.estado == "CERTIFICADO") {
                            content = `<button class="btn btn-sm text-secondary btn-download" type="button" data-id="${id}"><i class="fa-duotone fa-file-arrow-down"></i> Descargar Certificado</button>
                                        <button class="btn btn-sm text-secondary btn-view" type="button" data-id="${id}"><i class="fa-duotone fa-eye"></i> Ver Certificado</button>`
                                        ;
                        }
                        if(rol == 'ADMIN' && row.estado == "CERTIFICADO"){
                            content += `<button class="btn btn-sm text-danger check-cancel" type="button" data-id="${id}"><i class="fa-duotone fa-solid fa-trash"></i> Anular Certificado</button>`;
                        }
 
  
                        if (rol == "INSTRUCTOR") {
                            content = `<div role="group" class="button-group" aria-label="Basic example">
                                        <div class="d-flex justify-content-center">
                                            <div class="form-check me-2">
                                                <input class="form-check-input check-curso" type="checkbox" data-id="${id}" ${row.estado === 'INSCRITO' ? '' : 'disabled'}>
                                                <label class="form-check-label"> EN CURSO</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input check-aprobado" type="checkbox" data-id="${id}" ${row.estado === 'INSCRITO' || row.estado === 'APROBADO' ? 'disabled' : ''}>
                                                <label class="form-check-label"> APROBADO</label>
                                            </div>
                                        </div>
                                    </div>`;
                        }

                        return content;
                    }
                },
            ],
            drawCallback: () => {
                var rol = localStorage.getItem("rol"); // Obtiene el rol del usuario

                    $('.btn-dropdown-pago')
                    .off()
                    .on('change', (event: any) => {
                        var rol = localStorage.getItem("rol"); // Obtiene el rol del usuario
                        if (rol != "INSTRUCTOR") {
                            
                            this.validarPago(event.currentTarget.dataset.id);
                        } 
                    });

                    $('.btn-dropdown-pago-all')
                        .off()
                        .on('change', (event: any) => {
                            if (rol != "INSTRUCTOR") {
                                this.validarPagoAll();
                            } 
                         
                    });

                    
               
                $('.check-curso')
                    .off()
                    .on('change', (event: any) => {
                        this.updateEstado(event.currentTarget.dataset.id, "EN CURSO");
                    });
                $('.check-aprobado')
                    .off()
                    .on('change', (event: any) => {
                        this.updateEstado(event.currentTarget.dataset.id, "APROBADO");
                    });
                $('.check-certificado')
                    .off()
                    .on('change', (event: any) => {
                        this.updateEstado(event.currentTarget.dataset.id, "CERTIFICADO");
                    });
                $('.check-cancel')
                .off()
                .on('click', (event: any) => {
                    this.cancelCertificate(event.currentTarget.dataset.id, "APROBADO");
                });    

                $('.btn-download')
                    .off()
                    .on('click', (event: any) => {
                        var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.foreignKey = event.currentTarget.dataset.id; data.nameForeignKey = "InscripcionId"; data.fechaInicio = "", data.fechaFin = "";
                        this.download(data);
                    });
                $('.btn-view')
                    .off()
                    .on('click', (event: any) => {
                        var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.foreignKey = event.currentTarget.dataset.id; data.nameForeignKey = "InscripcionId"; data.fechaInicio = "", data.fechaFin = "";
                        this.openInNewTab(data);
                    });
                    $('.btn-details')
                    .off()
                    .on('click', (event: any) => {
                        // Obtiene el valor de data-id y lo divide en cursoId y cursoDetalleId
                        const data = event.currentTarget.dataset.id.split('|');
                        const cursoId = data[0];          // Primer parámetro
                        const cursoDetalleId = data[1];  // Segundo parámetro
                
                        // Llama a la función con los parámetros
                        this.viewDetails(cursoId, cursoDetalleId);
                    });   
            },
        };
    }

    viewDetails(id: number, detailsId: number) {
        this.router.navigate([`dashboard/operativo/cursos/editar/${id}`], {
            state: {
                detalleId: detailsId, // Pasando el valor correctamente
            },
        });
    }

    updateEstado(id: any, estado: string) {
        Swal.fire({
            title: `¿Está seguro de actualizar el estado a ${estado}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F8E12E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Actualizar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.helperService.showLoading();
                this.service.getById("Inscripcion", id).subscribe((res: any) => {
                    this.service.getByCode('Estado', estado).subscribe((j) => {
                        var inscripcion = {
                            Id: res.data.id,
                            Activo: res.data.activo,
                            CreateAt: res.data.createAt,
                            Codigo: res.data.codigo,
                            PagoValidado: true,
                            ClienteId: res.data.clienteId,
                            EstadoId: j.data.id,
                            CursoDetalleId: res.data.cursoDetalleId,
                            UsuarioRegistro: res.data.usuarioRegistro,
                        }

                        this.service.save("Inscripcion", id, inscripcion).subscribe(
                            (response) => {
                                if (response.status) {
                                    this.helperService.showMessage(
                                        MessageType.SUCCESS,
                                        Messages.UPDATESUCCESS
                                    );
                                    var rol = localStorage.getItem("rol");
                                    if (rol == "INSTRUCTOR") {
                                        var data = new DatatableParameter; data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.fechaInicio = ''; data.fechaFin = ''; data.foreignKey = ""; data.nameForeignKey = "";
                                        data.nameForeignKey ="EmpleadoId";
                                            data.foreignKey = this.userId;
                                            data.fechaFin = '';
                                            data.fechaInicio = '';
                                        this.cargarListaInstructores(data);
                                    } else {
                                        this.refrescarTabla();
                                    }
                                    this.helperService.hideLoading();
                                } else {
                                    this.helperService.hideLoading();
                                }
                            },
                            (error) => {
                                this.helperService.hideLoading();
                                this.helperService.showMessage(
                                    MessageType.WARNING,
                                    error
                                );
                            }
                        );
                    });
                });
            } else {
                $(".form-check-input").prop("checked", false);
            }
        });
    
    }
    // Method to cancel certificate to apprentices
    //start
    cancelCertificate(id: any, estado: string){
        Swal.fire({
            title: `¿Está seguro de anular el certificado de este estudiante?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F8E12E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Actualizar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.helperService.showLoading();
                this.service.getById("Inscripcion", id).subscribe((res: any) => {
                    this.service.getByCode('Estado', estado).subscribe((j) => {
                        var inscripcion = {
                            Id: res.data.id,
                            Activo: res.data.activo,
                            CreateAt: res.data.createAt,
                            Codigo: res.data.codigo,
                            PagoValidado: true,
                            ClienteId: res.data.clienteId,
                            EstadoId: j.data.id,
                            CursoDetalleId: res.data.cursoDetalleId,
                            UsuarioRegistro: res.data.usuarioRegistro,
                        }

                        this.service.save("Inscripcion", id, inscripcion).subscribe(
                            (response) => {
                                if (response.status) {
                                    this.helperService.showMessage(
                                        MessageType.SUCCESS,
                                        Messages.UPDATESUCCESS
                                    );
                                    
                                    var rol = localStorage.getItem("rol");
                                    if (rol == "ADMIN") {
                                        this.cargarListaAdmin();
                                    }
                                    this.helperService.hideLoading();
                                } else {
                                    this.helperService.hideLoading();
                                }
                            },
                            (error) => {
                                this.helperService.hideLoading();
                                this.helperService.showMessage(
                                    MessageType.WARNING,
                                    error
                                );
                            }
                        );
                    });
                });
            } else {
                $(".form-check-input").prop("checked", false);
            }
        });
    }
    //end

    validarPagoAll() {
        Swal.fire({
            title: '¿Está seguro de validar todos los pagos?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F8E12E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Validar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.helperService.showLoading();
                const table = $('.table').DataTable();
                const data = table.rows().data();
                for (let index = 0; index < data.length; index++) {
                    this.service.getById("Inscripcion", data[index].id).subscribe((res: any) => {
                        this.service.getByCode('Estado', 'INSCRITO').subscribe((j) => {
                            var inscripcion = {
                                Id: res.data.id,
                                Activo: res.data.activo,
                                CreateAt: res.data.createAt,
                                Codigo: res.data.codigo,
                                PagoValidado: true,
                                ClienteId: res.data.clienteId,
                                EstadoId: j.data.id,
                                CursoDetalleId: res.data.cursoDetalleId,
                                UsuarioRegistro: res.data.usuarioRegistro,
                            }

                            this.service.save("Inscripcion", data[index].id, inscripcion).subscribe(
                                (response) => {
                                    if (response.status) {
                                        this.helperService.showMessage(
                                            MessageType.SUCCESS,
                                            Messages.UPDATESUCCESS
                                        );
                                        this.refrescarTabla();
                                    }
                                },
                                (error) => {
                                    this.helperService.showMessage(
                                        MessageType.WARNING,
                                        error
                                    );
                                }
                            );
                        });
                        if (index == (data.length - 1)) {
                            setTimeout(() => {
                                this.helperService.hideLoading();
                            }, 200);
                        }
                    });
                }
            } else {
                $(".form-check-input").prop("checked", false);
            }
        });
    }

    validarPago(id: any) {
        Swal.fire({
            title: '¿Está seguro de validar el pago?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F8E12E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Validar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.helperService.showLoading();
                this.service.getById("Inscripcion", id).subscribe((res: any) => {
                    this.service.getByCode('Estado', 'INSCRITO').subscribe((j) => {
                        var inscripcion = {
                            Id: res.data.id,
                            Activo: res.data.activo,
                            CreateAt: res.data.createAt,
                            Codigo: res.data.codigo,
                            PagoValidado: true,
                            ClienteId: res.data.clienteId,
                            EstadoId: j.data.id,
                            CursoDetalleId: res.data.cursoDetalleId,
                            UsuarioRegistro: res.data.usuarioRegistro,
                        }

                        this.service.save("Inscripcion", id, inscripcion).subscribe(
                            (response) => {
                                if (response.status) {
                                    this.helperService.showMessage(
                                        MessageType.SUCCESS,
                                        Messages.UPDATESUCCESS
                                    );
                                    this.refrescarTabla();
                                    this.helperService.hideLoading();
                                } else {
                                    this.helperService.hideLoading();
                                }
                            },
                            (error) => {
                                this.refrescarTabla();
                                this.helperService.hideLoading();
                                this.helperService.showMessage(
                                    MessageType.WARNING,
                                    error
                                );
                            }
                        );
                    });
                });
            } else {
                $(".form-check-input").prop("checked", false);
            }
        })
    }

    Report() {
        let modal = this.modalService.open(ReportExelComponent, { size: 'lg', keyboard: false, backdrop: true, centered: true });
        modal.result.then(res => {
            if (res) {
                this.refrescarTabla();
            }
        })

        
    }
    


    download(data: DatatableParameter) {
        this.helperService.showLoading();
        this.service.datatableKey("Certificado", data).subscribe((res: any) => {
            try {
                
                if (res.status && res.data && res.data.length > 0) {
                    // Si el status es verdadero y existen datos, generamos el certificado
                    this.service.generarCertificado("Certificado", res.data[0].id).subscribe(
                        
                        (certificado: any) => {
                        var fileName = `${res.data[0].codigo}.${certificado.data.extension}`;
                        var base64String = certificado.data.content;
                        const binaryString = window.atob(base64String);
                        const binaryLen = binaryString.length;
                        const bytes = new Uint8Array(binaryLen);
                        for (let i = 0; i < binaryLen; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
        
                        const blob = new Blob([bytes], { type: `application/${certificado.data.extension}` });
                        const url = window.URL.createObjectURL(blob);
        
                        const a = document.createElement('a');
                        document.body.appendChild(a);
                        a.style.display = 'none';
                        a.href = url;
                        a.download = fileName;
        
                        setTimeout(() => {
                            this.helperService.hideLoading();
                        }, 200);
        
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    },(error)=>{
                        
                         // Si el status es falso o no hay datos, mostramos el mensaje de error
                        this.helperService.showMessage(MessageType.ERROR, error || "Error desconocido.");
                        this.helperService.hideLoading();
                    }
                
                );
                } else {
                    // Si el status es falso o no hay datos, mostramos el mensaje de error
                    this.helperService.showMessage(MessageType.ERROR, res.message || "Error desconocido.");
                    this.helperService.hideLoading();
                }
            } catch (error: unknown) {
                // Si ocurre un error durante el proceso, mostramos el mensaje de error
                if (error instanceof Error) {
                    this.helperService.showMessage(MessageType.ERROR, error.message || "Ocurrió un error inesperado.");
                    this.helperService.hideLoading();
                } else {
                    this.helperService.showMessage(MessageType.ERROR, "Ocurrió un error inesperado.");
                    this.helperService.hideLoading();
                }
            }
        });
        
        
    }

    openInNewTab(data: DatatableParameter) {
        this.helperService.showLoading();
        this.service.datatableKey("Certificado", data).subscribe((res: any) => {
            if (res.status) {
                this.service.generarCertificado("Certificado", res.data[0].id).subscribe((certificado: any) => {
                    // Decodificar el contenido base64
                    var base64String = certificado.data.content;
                    const binaryString = window.atob(base64String);
                    const binaryLen = binaryString.length;
                    const bytes = new Uint8Array(binaryLen);
                    for (let i = 0; i < binaryLen; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    // Establecer el tipo MIME basado en la extensión
                    let mimeType = '';
                    
                    switch (certificado.data.extension.toLowerCase()) {
                        case 'pdf':
                            mimeType = 'application/pdf';
                            break;
                        case 'jpg':
                        case 'jpeg':
                            mimeType = 'image/jpeg';
                            break;
                        default:
                            console.error('Extension de archivo no compatible');
                            return;
                    }

                    // Crear el blob
                    const blob = new Blob([bytes], { type: mimeType });

                    // Crear la URL del objeto
                    const url = window.URL.createObjectURL(blob);

                    setTimeout(() => {
                        this.helperService.hideLoading();
                    }, 200);
                    // Abrir el archivo en una nueva pestaña
                    window.open(url, '_blank');

                    // Liberar recursos
                    window.URL.revokeObjectURL(url);
                });
            }
        });
    }

    refrescarTabla() {
        if (typeof this.dtElement.dtInstance != 'undefined') {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.ajax.reload();
            });
        }
    }

    nuevo() {
        this.helperService.redirectApp('dashboard/operativo/inscripciones/crear');
    }

    update(id: any) {
        this.helperService.redirectApp(`dashboard/operativo/inscripciones/editar/${id}`);
    }

    deleteGeneric(id: any) {
        this.helperService.confirmDelete(() => {
            this.service.delete('Inscripcion', id).subscribe(
                (response) => {
                    if (response.status) {
                        this.helperService.showMessage(
                            MessageType.SUCCESS,
                            Messages.DELETESUCCESS
                        );
                        this.refrescarTabla();
                    }
                },
                (error) => {
                    this.helperService.showMessage(
                        MessageType.WARNING,
                        error
                    );
                }
            );
        });
    }

    importarDatos() {
        let modal = this.modalService.open(ClientesImportComponent, { size: 'lg', keyboard: false, backdrop: true, centered: true });
        modal.result.then(res => {
            if (res) {
                this.refrescarTabla();
            }
        })
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
        });
    }

    cargarCursoDetalle(cursoId: number) {
        var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = ''; data.foreignKey = cursoId; data.nameForeignKey = "CursoId";

        this.service.datatableKey('CursoDetalle', data).subscribe((res) => {
            res.data.forEach((item: any) => {
                this.listCursosDetalles.update((listCursosDetalles) => {
                    const DataSelectDto: DataSelectDto = {
                        id: item.id,
                        textoMostrar: `${item.curso} - ${item.salon} - ${item.nivel} - ${item.jornada}`,
                        activo: item.activo,
                    };

                    return [...listCursosDetalles, DataSelectDto];
                });
            });
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
        } else {
            this.cursoDetalle = false;
        }
    }

    buscar() {
        if (this.frmInscripciones.invalid) {
            this.statusForm = false;
            this.helperService.showMessage(MessageType.WARNING, Messages.EMPTYFIELD);
            return;
        }

        this.helperService.showLoading();
        this.cargarListaFilter();
    }

    cargarListaFilter() {
        var data = new DatatableParameter(); data.pageNumber = '';
        data.pageSize = ''; data.filter = ''; data.columnOrder = '';
        data.directionOrder = ''; 
        data.foreignKey = this.frmInscripciones.controls["CursoDetalleId"].value;
        data.nameForeignKey = "CursoDetalleId";
        data.fechaInicio = this.formatDate(this.frmInscripciones.controls["FechaInicio"].value); data.fechaFin = this.formatDate(this.frmInscripciones.controls["FechaFin"].value);
     
            this.service.datatableKey('Inscripcion', data).subscribe((res) => {
            // Actualiza los datos de la tabla
            var rol = localStorage.getItem("rol");
            if (rol == "INSTRUCTOR") {
                data.nameForeignKey ="EmpleadoId";
                data.foreignKey = this.userId;
               
               this.cargarListaInstructores(data);
            } else {
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    dtInstance.clear().rows.add(res.data).draw();
                });
            }
        });

        setTimeout(() => {
            this.helperService.hideLoading();
        }, 500);
    }

    formatDate(inputDate: string): string {
        // Convert input string to Date object
        let dateObject = new Date(inputDate);

        // Format the date using DatePipe
        return this.datePipe.transform(dateObject, 'yyyy-MM-dd HH:mm:ss') || "Invalid Date";
    }

    cargarListaInstructores(data: DatatableParameter) {
        this.service.dataTableInstructor('Inscripcion', data).subscribe((res) => {
            // Actualiza los datos de la tabla
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.clear().rows.add(res.data).draw();
                dtInstance.column(6).visible(false);
            });

            setTimeout(() => {
                this.helperService.hideLoading();
            }, 500);
        });
    }
    cargarListaAdmin() {
        
        var data = new DatatableParameter(); data.pageNumber = ''; data.pageSize = ''; data.filter = ''; data.columnOrder = ''; data.directionOrder = '';

        this.service.datatable('Inscripcion', data).subscribe((res) => {
            // Actualiza los datos de la tabla
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.clear().rows.add(res.data).draw();
                dtInstance.column(6).visible(false);
            });

            setTimeout(() => {
                this.helperService.hideLoading();
            }, 500);
        });
    }
}

@NgModule({
    declarations: [InscripcionesIndexComponent],
    imports: [CommonModule, GeneralModule],
})
export class InscripcionesIndexModule { }
