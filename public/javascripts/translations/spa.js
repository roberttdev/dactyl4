window.I18n.load({
  namespace: 'WS',
  code: 'spa',
  nplurals: 2,
  pluralizer: function(n){
    return (n != 1) ? 1 : 0;
  },

  strings: {"TRUE":"Verdadero","access":"Acceso","access_level":"Nivel de Acceso","access_level_edit_closing":"Cambiar el nivel de acceso tardará unos momentos. Se va a cerrar el documento durante ese proceso.","account":"Cuenta","account_add_failure":"No se pudo crear a la cuenta.","account_is_disabled":"%s se ha desactivado.","accounts":"Cuentas","add":"Añadir","add_a_collaborator":"Añadir a un colaborador a este proyecto","add_html_for_documents":"Añadir este HTML a tu sitio para incrustar estos documentos.","add_html_for_note":"Añade este HTML a tu sitio web para incrustar esta nota.","add_html_for_viewer":"Añadir este HTML a tu sitio web para incrustar un marco para ver el documento.","add_note_instructions":"Destacar una parte de la página, o hacer clic entre páginas para crear una nota.","add_private_note":"Añadir una nota privada.","add_private_note_warn":"Nadie más que tú jamas podrá ver tus notas privadas.","add_public_note":"Añadir una Nota Pública","add_public_note_warn":"Notas Públicas son visibles para todos los que vean este documento.","add_reviewer":"Añadir Revisor","added_project":"añadido a este proyecto","added_to_x_documents":["Se agregó un documento a %s","Se agregaron %d documentos a %s"],"adding_accounts":"Añadir Cuentas","administrator":"Administrador","all_documents":"Todos los Documentos","allow_readers_to_search":"Permitir que lectores busquen esta colección de documentos","already_has_account":"%s ya tiene una cuenta.","analyze":"Analizar","analyze_project_in_overview":"Analizar este Proyecto en Panorama","analyze_x_docs_in_overview":["Analyze this Document in Overview","Analyze these Documents in Overview"],"annotated":"Anotado ","annotated_by":"Anotado por: %s","annotated_documents":"Documentos Anotados","annotation":"anotación","annotation_help":"Utiliza los enlaces a la derecha para anotar el documento. Recuerda que cualquier otros revisores podrán ver anotaciones públicas y borradores. Anotaciones privadas existen para tu referencia exclusiva. Ni %s las pueden ver.","apply_all_files":"aplicar a todos los archivos","apply_fields_all_files":"aplicar esta descripción, fuente, y nivel de acceso a todos los archivos","at":"a","back":"Volver","bad_data_key":"%s no se puede utilizar como clave","before_continue":"Antes de continuar, puedes %s","black":"negro","broken_document":"Documento roto","by_date":"por fecha","by_length":"por extensión","by_relevance":"por relación","by_source":"por fuente","by_title":"por título","calais_credit":"Entidades a través de OpenCalais","cancel":"Cancelar","cannot_remove_all":"No se puede eliminar todas las páginas de este documento.","change_page_arrows":"Cambiar páginas con las flechas a la derecha.","change_password":"Cambiar Contraseña","choose_location_to_insert_pages":"Elija un lugar para insertar páginas.","choose_note":"Elejir nota","city":"Ciudad ","close":"Cerrar","close_while_redacting":"Este documento se está redactando. Se va a cerrar mientras se procesa.","close_while_text_reprocess":"El texto se está procesando. Cierra este documento por favor.","collaboration":"Colaboración","collaborators":"Colaborador","confirm_remove_all_data":"¿Estás seguro de que quieres eliminar todos los datos de %s?","contact_documentcloud":"Contactar a DocumentCloud","contact_reviewer":"Contactar a %s en %s si necesitas cualquier ayuda, o visita %s para más información sobre DocumentCloud.","contact_us":"Contáctenos","contributed_by":"Contribuido por","contributor":"Contribuidor","country":"Países","create_new_project":"Crear un Proyecto Nuevo","date":"Fechas","date_uploaded":"Fecha Subido","default_document_language":"Documento predeterminado Idioma","delete":"Borrar","delete_documents":["Borrar Documento","Borrar Documentos"],"deleting_documents":"Eliminación de documentos ... ","demo_embed_error":"Las cuentas demo no se les permite integrar documentos. Póngase en %scontacto%s con nosotros si necesita una cuenta con todas las funciones. Ver %sun ejemplo%s de código de inserción aquí","demo_no_viewer":"No se permiten descargar marcos con cuentas de preuba. %s si necesitas una cuenta de acceso completo.","description":"Descripción","disable":"Desactivar","disabled":"Desactivado","document":"Documento","document_access_updated":["Acceso actualizado para este documento","Acceso actualizado para %d documentos"],"document_already_public":"Este documento ya está disponible al público.","document_error_message":"Nuestro sistema no pudo procesar este documento. Estamos atentos al problema y regularmente revisamos errores. Por favor revisa nuestras %ssugerencias para resolver fallos técnicos%s o %scontáctanos%s para obtener asistencia inmediata.","document_has_no_public_notes":"Este documento no tiene notas públicas.","document_modification":"Modificación de Documentos","document_processing_count":["Se está procesando un documento","Se están procesando %d documentos"],"document_public_on":"Este documento estará disponible al público el/en %s","document_publish_embed_test":"Si quieres probar el incrustado del documento antes de publicarlo, procura modificar el código de incrustar para que use URLs seguros de HTTPS, y luego cambiarles a HTTP común antes de designarle al documento público.","document_publish_private_help":"Este documento es privado. No será visible para los lectores hasta que lo designes público. Cambiar el %snivel de acceso%s ahora o %s fecha de actualización.","document_publish_public_help":"Este documento es público. Es accesible por los usuarios que buscan el catálogo de DocumentCloud y se podrá ver en tu sitio web. Cambiar el %snivel de acceso%s.","document_tools":"Herramientas","document_viewer_size":"Tamaño del documento","documents":"Documentos","documents_are_ready":"Sus documentos están listos","documents_per_page":"Documentos por página","double_check_disable":"¿Seguro que quieres desactivar la cuenta de %s?","download_pdf":"Descargar PDF Original","download_text":"Descargar Text Completo","download_viewer":"Descargar Marco de Revisión","downloading_progress":["Preparación de \"%2$s\" para descargar ...","Preparación %d documentos para descargar"],"draft":"Borrador","draft_note_visible":"Esta nota en borrador sólo la pueden ver tú y tus colaboradores.","edit":"Editar","edit_access":"Editar Nivel de Acceso","edit_data":"Editar datos","edit_data_for":"Editar datos de %s","edit_description":"Editar Descripción","edit_details":"editar detalles","edit_document_data":"Editar Datos del Documento","edit_document_info":"Editar información del documento","edit_document_information":"Editar Información del Documento","edit_document_pairs":["Editar parejas de clave/valor que describen a este documento.","Editar parejas de clave/valor que describen a estos documentos."],"edit_page_text":"Editar Texto de Página","edit_page_text_done":"Cuando termines de revisar el texto, haz clic en el botón \"Guardar Texto\".","edit_page_text_instructions":"Edita el texto de cualquier página: usa las flechas para navegar dentro de este documento. Editando el texto aquí no cambiará el PDF original.","edit_published_url":"Editar URL Publicado","edit_related_url":"Editar URL de Artículo Relacionado","edit_sections":"Editar Secciones","edit_source":"Editar Fuente","edit_text_any_page":"Editar el texto de cualquier página.","edit_title":"Editar Título","edit_x":"Editar %s","editing_notes_sections":"Editar Notas y Secciones","email":"Correo electrónico","email_for_assistance":"Si necesitas asistencia, envíanos un correo electrónico a support@documentcloud.org.","email_when_complete":"Notifícame cuando %slos documentos%s estén procesados.","embed_a_note":"Incrustar una Nota","embed_document":"Incrustar este Documento","embed_document_list":"Incrustar Lista de Documentos","embed_document_viewer":"Incrustar Marco de Revisión","embed_hide_text_tab_help":"Si el texto del documento no se lee bien, haz click en esta caja para esconder la pestaña de texto.","embed_note":"Incrustar una Nota","embed_note_demo_error":"No se permite incrustar notas con cuentas de prueba. %sContáctanos%s si quieres una cuenta de acceso completo. Ve un ejemplo del código de incrustar %saquí%s.","embed_note_step_one":"Primer Paso: Seleccionar una nota para incrustar","embed_note_step_two":"Segundo Paso: Copia y pega el código para incrustar","embed_search_demo_error":"No se permite incrustar sets de documentos con cuentas de prueba. %sContáctanos%s si quieres una cuenta de acceso completo. Ve un ejemplo del código de incrustar %saquí%s.","embed_search_step_one":"Primer Paso: Configurar los Documentos Incrustados","embed_search_step_two":"Segundo Paso: Copiar y Pegar el Código de Incrustar","embed_show_sidebar":"Mostrar el sidebar","embed_show_sidebar_help":"Si el espacio horizontal de tu sitio es limitado, haz clic en esta caja para esconder el sidebar.","embed_show_text_tab":"Mostrar la pestaña de texto","embed_step_one_title":"Paso uno: Revisión \"%s\"","embed_step_three_title":"Tercer paso: Copiar y pegar el código de inserción","embed_step_two_title":"Paso dos: Configurar el marco de documentos","embed_tools":"Incrustar Herramientas","embed_url_of_document":"La mayoría de usuarios no necesitarán añadir esto. URL de la página en tu sitio web donde este documento está incrustado","embed_viewer_opens_to":"Marco abre a","embed_viewer_opens_to_help":"Definir la página o anotación específic que abrirá el marco.","enter_email_address":"Proveer correo electrónico","enter_new_password":"Proveer nueva contraseña","enter_title_and_page":"Por favor añade un título y número de página para cada sección.","enter_url_for_embed":["Proveer URL donde este documento está incrustado","Proveer URL donde estos documentos están incrustados"],"enter_url_that_references":["Provee el URL del artículo que se refiere a este documento.","Provee el URL del artículo que se refiere a estos documentos."],"entities_explained":"Las entidades listadas están presentes adentro de los documentos relacionados con tu búsqueda. Selecciona una entidad para filtrar estos resultados.","entities_unavailable":"Entidades no están disponibles en estos momentos.","error":"Error ","explain_disable_account":"%1$s no podrá acceder a DocumentCloud. Documentos y anotaciones públicas de %1$s permanecerán disponibles. %2$sContactar a soporte técnico%3$s para purgar completamente la cuenta de %1$s.","export":"Exportar","export_to_overview_explain":"Estás a punto de exportar a Panorama. Necesitas crear una cuenta de Panorama que requiere tu nombre de usuario y contraseña de DocumentCloud.","featured_examples_list":"Puedes ver varios ejemplos de documentos incrustados en nuestra lista de %sreportajes destacados%s.","featured_reporting_list":"Puedes encontrar ejemplos de búsquedas incrustadas en nuestra lista de %sreportajes destacados%s.","filter":"Filtro ","finish":"Acabados","first_name":"Nombre","first_page":"Primera Página","fixed_size":"Tamaño fijo ","for_example_data":"Por ejemplo: \u0026ldquo;birth: 1935-01-08\u0026rdquo;, or \u0026ldquo;status: released\u0026rdquo;","force_ocr":"Forzar OCR","form_contact_instructions":"Utiliza este formulario (o mándanos un email a %s) para solicitar asistencia. Si necesitas hablar con alguien inmediatamente, llama al (202) 505-1010. Visita %s para otras formas de ponerte en contacto con nosotros.","freelancer":"Freelancer","full_page":"Página Completa","future_documents_w_appear":"Documentos en el futuro %s aparecerán en tu incrustado.","group":"Grupo","guided_tour":"Tur Guiado","guides_howtos":"Guías","has_no_entities":"%s no dispone de entidades para revisar.","height":"Altura","help":"Ayuda","help_pages":"páginas de ayuda","home":"Página de inicio","in_project":"en este proyecto","include_optional_msg":"Opcional: Incluir un mensaje personal","insert_between_pages":"Insertar entre las páginas %d y %d","insert_first_page":"Insertar antes de la primera página","insert_last_page":"Insertar después de la última página","insert_pages_instructions":"Para insertar nuevas páginas en posición específica dentro del documento, haz clic entre las páginas arriba. Si quieres reemplazar una página específica con una copia nueva, haz clic en la página que quieres quitar.","insert_pages_message":"Este documento será cerrado mientras se reconstruye. Documentos largos pueden tardar bastante tiempo en reconstruirse.","insert_pages_shift_key":"Oprime la tecla \"Shift\" mientras seleccionas múltiples páginas para reemplazar a la misma vez. Cuando estés listo, haz clic en el botón \"Subir Páginas\".","insert_replace_pages":"Insertar/Reemplazar Páginas","introduction":"Introducción","language":"idioma","language_defaults":"Predeterminados de Idiomas","last_name":"Apellido","length":"Extensión","link_to_pdf":"Enlace al PDF original","link_to_pdf_help":"Haz clic en esta caja para quitar el enlace al PDF original del marco.","log_in":"Iniciar sesión\n","log_out":"Terminar la sesión","logged_in_as":"Conectado como %s","make_document_public":"Permitir acceso público al documento","make_documents_public":"Cambiar acceso a público de %slos documentos%s.","make_public_on":"Cambiar acceso a público","manage":"Administrar","manage_account":"Administrar Cuenta","manage_organization":"Administrar Organización %s","matching_search":"igual que esta busqueda","max_upload_size_warn":"Sólo se pueden subir documentos que pesen menos de 200MB. Por favor %soptimiza tus documentos%s antes de continuar.","mentioned_in_x_documents":["Mencionada en un documento","Mencionada en %d documentos"],"mentioning_query":"mentioning \u0026ldquo;%s\u0026rdquo;","message":"Mensaje","modification":"modificación","modify_original_document":"Modificar el Documento Original","must_have_doc_title":["Por favor provee un título pare este documento","Por favor provee un título pare estos documentos documents."],"must_have_title":"Por favor provee un títular.","must_upload_something":"Necesitas subir al menos un documento.","new_account":"Crear una cuenta nueva","new_documents":"Documentos Nuevos","new_project":"Proyecto Nuevo","next":"Próximo","no_appear_until_publish":"no aparecerá hasta que se publique.","no_dates_for_timeline":["Fuimos incapaces de reconocer cualquier fecha para %2$s. ","Ninguno de los documentos %d contenía fechas reconocibles. "],"no_duplicate_section":"No se puede duplicar una sección.","no_embed_permission":"Usted no tiene permiso para insertar el documento.","no_entities_found":"Ninguna entidad resultó relacionada con tu búsqueda.","no_past_publication":"No puedes designar que se publique un documento en el pasado.","no_permission_to_edit_x":"Usted no tiene permiso para edita \"%s\".","no_project_doc_selected":"No has seleccionado un proyecto o documentos","no_projects_help":"Esta cuenta aun no tiene proyectos. Para crear uno, haz click en el botón de \"Proyecto Nuevo\" arriba.","no_results_for":"No hay resultados para %s ","no_reviewer_on_document":["No hay revisores en este documento.","No hay revisores en estos documentos."],"no_section_outside_doc":"No se puede crear una sección afuera de el documento.","not_found_account":"Esta cuenta no tiene documentos.","not_found_all":"No hay documentos","not_found_annotated":"No existen documentos anotados.","not_found_group":"Esta organización no tiene documentos.","not_found_project":"Este proyecto no tiene documentos.","not_found_published":"Esta organización no tiene documentos.","not_found_search":"No hay documentos relacionados con tu busqueda.","note":["Nota","Notas"],"note_ellipsis":"Nota ...","note_embed_private":"Este documento es privado: notas en este documento no se podrán ver hasta que sea público.  Cambiar el %snivel de acceso%s ahora o","notes_hidden_while_redacting":"Cualquier notas que existan serán ocultadas mientras se guarda la redacción.","of":"de","ok":"OK","open":"Abrir","open_in_viewer":"Abrir todas las páginas en el marco","open_published":"Abrir Versión Publicada","open_published_version":"Abrir Versión Publicada","optional":"Opcional","or":"o","or_remove_all_data":"o %seliminar todo los datos%s.","order_documents_by":"Ordenar documentos por","organization":["Organizaciones","Organizaciones "],"organizations_documents":"Documentos de %s","over_x_mentions":"Por %d menciones","page":["Página","Páginas"],"page_ellipsis":"Página ...","page_tools":"Herramientas de Página","pages_are_being_removed":"Se están eliminando las páginas. Por favor, cierre el documento.","paragraph_description_of_document":"Un párafo descriptivo de este documento","password_no_blank":"Tu contraseña no puede quedar vacio","password_reset":"Restablecimiento de contraseña DocumentCloud","password_updated":"Contraseña actualizada","pending":"Pendiente","person":"Personas","pg":"p.","phone":"Teléfono","place":"Lugares ","please_enter_email":"Introduzca una dirección de correo electrónico.","please_enter_valid_email":"Introduzca una dirección de correo electrónico válida.","popular":"Popular ","popular_documents":"Documentos Populares","preview_email":"Revisar el mensaje","preview_search_embed_help":"Antes de continuar, por favor toma el tiempo de %s revisar la colección de documentos%s Documentos publicados estarán disponibles en el URL donde originalmente fueron publicados, mientras otros se abrirán en DocumentCloud.","preview_viewer":"Antes de continuar, por favor %srevisa el marco del documento%s.","print_notes":"Imprimir Notas","print_notes_missing_error":"%s no contiene ningún notas imprimibles.","privacy":"Privacidad","private":"Privado","private_access":"Acceso Privado","private_access_help":"Sólo personas con permiso explícito (vía colaboración) tienen acceso.","private_documents_visible_instructions":["Este documento es privado. Necesitas cambiar el acceso a público antes de que sea disponible en tu sitio web o en búsquedas del catálogo de DocumentCloud. Puedes cambiar el acceso en el futuro o %2$sahora%3$s.","Estos documentos son privados. Necesitas cambiar su acceso a público antes de que sean disponibles en tu sitio web o en búsquedas del catálogo de DocumentCloud. Puedes cambiar su acceso en el futuro o %2$sahora%3$s"],"private_note":"Nota privada","private_note_visible":"This private note is only visible to you.","private_to":"Privado de %s","private_to_organization_help":"Acceso limitado a tu organización. (No freelancers.)","project":"Proyecto","project_exists":"Un proyecto con el nombre %s ya existe","project_id":"ID de Proyecto: %s","project_owner":"Dueño del Proyecto","projectid":"Project ID","projects":"Proyectos","public":"Público ","public_access":"Acceso Público","public_access_help":"Cualquier usuario de la Internet puede buscar y ver este documento.","public_documents_help":"Selecciona una organización de la lista arriba para ver sus documentos públicos.","public_on":"Acceso Público","publication_date":"fecha de publicación","publish":"Publicar","publish_choose_display":"Elije si quieres ofrecer tu documento de %spágina completa%s o si quieres %suna caja de tamaño específico%s.","published":"Publicado ","published_documents":"Documentos Publicados","published_url":"URL Publicado","publishing_embedding":"Publicar e Incrustar","reader_workspace_language":"Lector/Espacio de trabajo Idioma","really_delete_x_docs":["¿Seguro que quieres borrar este documento?","¿Seguro que quieres borrar estos documentos?"],"red":"rojo","redact_document":"Redactar Documento","redact_instructions":"Haz clic y arrastra para dibujar un %s rectángulo por encima de cada parte del documento que quieras redactar. El texto asociado será suprimido cuando guardes tu redacción.","redaction_close_while_processing":["Has redactado una parte de este documento. Se require cerrar el documento mientras se reconstruye. ¿Estás seguro de que quieres continuar?","Has redactado %d partes de este documento. Se require cerrar el documento mientras se reconstruye. ¿Estás seguro de que quieres continuar?"],"reenable":"Reactivar","related_article_url":"URL de Artículo Relaciónado","related_article_url_help":"Proveer el URL del artículo que se refiere a este documento permitirá crear un enlace al \"Artículo Relacionado\" adentro del marco que muestra el documento. Muchos lectores llegarán al documento a través de una busqueda; el enlace les guiará al contexto orginal del documento.","related_url_of_document":"URL del artículo que se refiere a este documento","relevance":"Relación","remove":"Eliminar","remove_all":"Eliminar todo","remove_entity":"Eliminar esta entidad de mi búsqueda","remove_file":"Eliminar archivo","remove_from_project":"Quitar de este Proyecto","remove_line_breaks":"Eliminar saltos de línea","remove_page_warning_message":["Usted ha seleccionado una página para su eliminación. Este documento se cierra mientras se está reconstruyendo. ¿Estás seguro de que está listo para proceder?","Usted ha seleccionado %d páginas para su eliminación. Este documento se cierra mientras se está reconstruyendo. ¿Estás seguro de que está listo para proceder?"],"remove_pages":"Eliminar Páginas","remove_pages_click":"Haz clic en cada página que quieras eliminar de este documento.","remove_pages_done":"Cuando termines de seleccionar las páginas que quieras eliminar, hac click en el botón \"Eliminar Páginas\".","remove_pages_input":["Retire página","Quite %d Páginas"],"removed_from_x_documents":["Se eliminó un documento de %s","Se eliminaron %d documentos de %s"],"removing":"Extracción de ...","reorder_hint":"Reordenar páginas arrastrando y soltando.","reorder_pages":"Reordenar Páginas","reorder_pages_done":"Cuando termines de reordenar, haz clic en el botón \"Guardar Orden\" para guardar tus cambios.","reorder_pages_instructions":"Arrastra y suelta páginas para cambiar sus posiciones dentro del documento.","replace_multiple_pages":"Reemplazar las páginas %d a %d","replace_page_x":"Reemplazar página %d","reprocess":"Reprocesar","reprocess_text":"Reprocesar Texto","resend_instructions":"Reenviar Instrucciones","resend_welcome_email":"Reenviar Correo de Bienvenida","restricted":"Restringido","review_x_documents":["Crítica \"%2$s\" en DocumentCloud","Revise %d documentos en DocumentCloud"],"reviewer":"Revisor","reviewer_add_permission_denied":"No se permite añadir colaboradores.","reviewer_email_instructions":["Las instrucciones por correo electrónico a %2$s","Las instrucciones por correo electrónico a %d revisores"],"reviewer_email_message":"DocumentCloud le enviará revisar las instrucciones a %s Si lo desea, puede agregar un mensaje personal.","reviewer_enter_email":"Introduzca la dirección de correo electrónico de la primera crítica de invitar:","reviewer_name":"Por favor, indique el nombre del revisor","reviewer_remove_error":"Hubo un problema al eliminar el revisor.","reviewer_remove_permission_denied":"No tienes permiso para eliminar colaboradores.","reviewing_instructions_multiple_sent_to":"Instrucciones para la revisión de %d Documentos enviados a %s","reviewing_instructions_send_failure":"Sus instrucciones no fueron enviados. Póngase en contacto con soporte para resolución de problemas ayuda.","reviewing_instructions_single_sent_to":"Instrucciones para la revisión %s enviado a %s","revoke":"Revocar","role_administrator_for_x":"Usted es un administrador para %s ","role_contributor_for_x":"Usted es un contribuyente para %s","role_freelancer_for_x":"Usted es un profesional independiente para %s","role_reviewer_for_x":"Usted es un revisor para %s","save":"Guardar","save_as_draft":"Guardar como borrador","save_page_order":"Guardar Orden de Páginas","save_redactions":"Guardar Redacciones","save_text":"Guardar Texto","saved":"Guardar","search":"Buscar","search_bar":"barra de búsqueda","searching_dd":"Busquedas de Documentos y Datos","select_pages_remove":"Selecciona las páginas que quieres eliminar.","select_single_to_embed":"Por favor elije a un documento para crear un incrustado.","select_single_to_open":"Por favor selecciona el documento que quieres abrir.","select_with_public_note":"Por favor selecciona un documento que tenga al menos una nota.","send":"Transmitir","sending":"Envío de ...","set_access":"Definir Nivel de Acceso","set_publication_date":"Definir fecha de publicación","set_publication_date_for":"Definir fecha de publicación para %s","set_the":"designar el","set_will_appear":"aparecerá en esta colección.","share_documents":"Compartir estos Documentos","share_project":"Compartir este Proyecto","share_x_documents":["Compartir este Documento","Compartir estos Documentos"],"shared_with_you_by":"Compartido por ti %s","show_all":"Mostrar todas","show_all_x_pages":["Mostrar una página","Mostrar todas las %d páginas"],"show_less":"Mostrar menos","show_more":"Mostrar más","show_pages":"mostrar páginas","signup_sent_to":"Solicitud para crear una cuenta enviada a %s","sort":"Filtrar","sort_by_date_uploaded":"Filtrar por Fecha Subido","sort_by_length":"Filtrar por Extensión","sort_by_relevance":"Filtrar por Relación","sort_by_source":"Filtrar por Fuente","sort_by_title":"Filtrar por Título","sort_documents_by":"Filtrar documentos por","source":"Fuente","source_of_document":"La fuente donde obtuviste este documento","state":"Unidos","step_x_of_x":"Paso %d de %d","term":"Condiciones","terms":"Terminos de Uso","text":"Texto","text_reprocess_help":"Reprocesa este documento para aprovechar de mejoras en nuestras herramientas de extracción de texto. Elije \"Forzar OCR\" (optical character recognition) para ignorar cualquier texto incrustado en el documento y usar Tesseract antes de reprocesar. El documento se va a cerrar mientras se reconstruye. ¿Quieres continuar?","text_tools":"Herramientas de Texto","the_api":"El API de DocumentCloud","timeline_for_doc":"Cronograma para \"%s\"","timeline_for_x_docs":"Cronograma para %d documentos","timeline_max_documents":"Sólo puedes ver una cronología de 10 documentos a la vez.","timeline_must_select":"Para ver una cronología, por favor selecciona algunos documentos.","timeline_zoom_in":"Arrastre un rango de fechas para agrandar","title":"Títular","title_of_document":"Título de este documento","tools_help":"Nuestras %s te pueden ayudar a sacar el máximo provecho de nuestros %s y %s herramientas.","troubleshooting_uploads":"Solucionar Subida de Documentos Decaido","unpublished":"Inédito ","update_applied_all":"Actualización aplicada a todos los documentos.","upload":"Subir","upload_document":"Subir Documento","upload_pages":"Subir Páginas","uploaded_x_document_has":["el documento subido tiene","los %d documentos tienen"],"uploaded_x_documents":["Un Documunto subido","%d Documentos subidos"],"uploading":"Subiendo","uploading_documents":"Subir Documentos","uservoice_discuss":"Discutir servicio y Bugs","view_entities":"Ver Entidades","view_pages":"Ver Páginas","view_timeline":"Ver cronología","welcome_message_sent_to":"Un mensaje de bienvenida se envió a  %s.","welcome_to_document_cloud":"Bienvenido a DocumentCloud ","width":"Anchura","workspace":"Área de trabajo","x_accounts":["%d cuenta ","%d cuentas"],"x_collaborators":["Un Colaborador","%d Colaboradores"],"x_documents":["%d Documento","%d Documentos"],"x_has_documents":"%s Documentos","x_invited_to_review_x":"%s te ha invitado a revisar %s","x_is_no_longer_a_reviewer_on_x":["%2$s ya no es un crítico en el documento","%2$s ya no es un crítico de los %1$d Documentos"],"x_is_not_published":"\"%s\" no se publica.","x_mentions":["Una Mención","%d Menciones"],"x_notes":["Una Nota","%d Notas"],"x_pages":["Una Página","%d Páginas"],"x_private_documents":["%d Documento Privado","%d Documentos Privados"],"x_public_documents":["%d Documento Público","%d Documentos Públicos"],"x_results":["%d Resultado ","%d Resultados"],"x_still_processing":"\"%s\" está siendo procesada. Espere a que termine por favor.","your_documents":"Tus Documentos","your_organization":"Tu Organización","your_published_documents":"Tus Documentos Publicados","youve_been_added_to_x":"Usted se han añadido a la cuenta %s","zoom_out":"Alejar"}

});
