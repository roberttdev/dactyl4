window.I18n.load({
  namespace: 'WS',
  code: 'eng',
  nplurals: 2,
  pluralizer: function(n){
    return (n != 1) ? 1 : 0;
  },

  strings: {"TRUE":"TRUE","access":"Access","access_level":"Access Level","access_level_edit_closing":"Changing the access level will take a few moments. The document will close while it processes.","account":"Account","account_add_failure":"Could not add the account.","account_is_disabled":"%s has been disabled.","accounts":"Accounts","add":"Add","add_a_collaborator":"Add a collaborator to this project","add_html_for_documents":"Add this HTML to your site to embed these documents.","add_html_for_note":"Add this HTML to your site to embed the note.","add_html_for_viewer":"Add this HTML to your site to create a document viewer.","add_note_instructions":"Highlight a portion of the page, or click between pages to create a note.","add_private_note":"Add a Private Note","add_private_note_warn":"No one apart from you is ever allowed to view your private notes.","add_public_note":"Add a Public Note","add_public_note_warn":"Public notes are visible to everyone who views this document.","add_reviewer":"Add Reviewer","added_project":"added to this project","added_to_x_documents":["Added a document to %s","Added %d documents to %s"],"adding_accounts":"Adding Accounts","administrator":"Administrator","all_documents":"All Documents","allow_readers_to_search":"Allow readers to search this set of documents","already_has_account":"%s alread has an account.","analyze":"Analyze","analyze_project_in_overview":"Analyze this Project in Overview","analyze_x_docs_in_overview":["Analyze this Document in Overview","Analyze these Documents in Overview"],"annotated":"Annotated","annotated_by":"Annotated by: %s","annotated_documents":"Annotated Documents","annotation":"annotation","annotation_help":"Use the links at the right to annotate the document. Keep in mind that any other reviewers will be able to see public annotations and drafts. Private annotations are for your own reference. Even %s can't see them.","apply_all_files":"apply to all files","apply_fields_all_files":"apply this description, source, and access level to all files","approve_all":"Approve All","assign_to_self":"Assign To Self?","at":"at","back":"Back","bad_data_key":"%s cannot be used as a key","before_continue":"Before continuing, you can take a moment to %s","black":"black","blank_field_error":"A field is blank.  Please enter a value or delete it.","blank_note_error":"Please enter a note explaining the rejection.","broken_document":"Broken document","by_date":"by date","by_length":"by length","by_relevance":"by relevance","by_source":"by source","by_title":"by title","calais_credit":"Entities provided by OpenCalais","cancel":"Cancel","cannot_remove_all":"You can't remove all the pages from this document.","change_page_arrows":"Change pages with the arrows on the right.","change_password":"Change Password","choose_location_to_insert_pages":"Choose a location to insert pages.","choose_note":"Choose note","city":"City","claimed":"Claimed","close":"Close","close_while_redacting":"The document is being redacted. It will close while processing.","close_while_text_reprocess":"The text is being processed. Please close this document.","collaboration":"Collaboration","collaborators":"Collaborator","complete_qc":"Mark Quality Control Complete","complete_qa":"Mark Quality Assurance Complete","confirm_drop_claim":"Are you sure you want to drop this document?  You will lose all of your work.","confirm_group_delete":"Are you sure you want to delete this group?  Your subgroups and data points will be lost.","confirm_mark_complete":"Are you sure you want to mark your work as complete?","confirm_point_delete":"Are you sure you want to delete this data point?","confirm_remove_all_data":"Are you sure you want to remove all data from %s?","confirm_template_delete":"Are you sure you want to delete this template?","contact_documentcloud":"Contact DocumentCloud","contact_reviewer":"Contact %s at %s if you need any help, or visit %s for more information about DocumentCloud.","contact_us":"Contact Us","contributed_by":"Contributed by","contributor":"Contributor","country":" Countries","create_group":"Edit Group","create_new_project":"Create a New Project","data_entry":"Data Entry","data_extraction":"Data Extraction","data_points":"Data Points","date":" Dates","date_uploaded":"Date Uploaded","de_left":"Data Entry 1 (Left)","de_right":"Data Entry 2 (Right)","default_document_language":"Default Document Language","delete":"Delete","delete_documents":["Delete Document","Delete Documents"],"deleting_documents":"Deleting Documents ...","demo_embed_error":"Demo accounts are not allowed to embed documents. %sContact us%s if you need a full featured account. View an example of the embed code %shere%s.","demo_no_viewer":"Demo accounts are not allowed to download viewers. %s if you need a full featured account.","description":"Description","disable":"Disable","disabled":"Disabled","document":"Document","document_access_updated":["Access updated for the document","Access updated for %d documents"],"document_already_public":"This document is already public.","document_error_message":"Our system was unable to process this document. We've been notified of the problem and periodically review these errors. Please review our %stroubleshooting suggestions%s or %scontact us%s for immediate assistance.  ","document_has_no_public_notes":"This document has no public notes.","document_modification":"Document Modification","document_processing_count":["There is one documents being processed","There are %d documents being processed"],"document_public_on":"This document will be public on %s","document_publish_embed_test":"If you want to test the embed before publication, make sure to edit the embed code to use secure HTTPS URLs, and then switch back to regular HTTP before making the document public.","document_publish_private_help":"This document is private. It will not be visible to your readers until you make it public. Change the %saccess level%s now or %s publication date","document_publish_public_help":"This document is public. It is currently available to users who search DocumentCloud's catalog and will be visible to the public when you embed it on your website. Change the %saccess level%s.","document_tools":"Document Tools","document_viewer_size":"Document viewer size","documents":"Documents","documents_are_ready":"Your documents are ready","documents_per_page":"Documents per page","double_check_disable":"Really disable %s's account?","download_original":"Download Original File","download_pdf":"Download Original PDF","download_text":"Download Full Text","download_viewer":"Download Document Viewer","downloading_progress":["Preparing \"%2$s\" for download...","Preparing %d documents for download"],"draft":"Draft","draft_note_visible":"This draft is only visible to you and collaborators.","duplicate_point_error":"A point by this name already exists here.  Overwrite?","duplicate_titles":"Two points have the same title ('%1$s').  Please modify the points to have unique titles.","duplicate_titles_fail":"Two or more points share a title with an already approved point in this group.  These points were not approved. \u003cbr\u003e%1$s","edit":"Edit","edit_access":"Edit Access Level","edit_data":"Edit Data","edit_data_for":"Edit Data for %s","edit_description":"Edit Description","edit_details":"edit details","edit_document_data":"Edit Document Data","edit_document_info":"Edit Document Information","edit_document_information":"Edit Document Information","edit_document_pairs":["Edit key/value pairs describing this document.","Edit key/value pairs describing these documents."],"edit_page_text":"Edit Page Text","edit_page_text_done":"When you’re finished revising the text, click the “Save Text” button.","edit_page_text_instructions":"Edit the text of any page: use the navigation arrows at the top to page through this document. Editing the text here will not alter the original PDF.","edit_published_url":"Edit Published URL","edit_related_url":"Edit Related Article URL","edit_sections":"Edit Sections","edit_source":"Edit Source","edit_subtemplate":"Edit Subtemplate","edit_template":"Edit Template","edit_text_any_page":"Edit the text of any page.","edit_title":"Edit Title","edit_x":"Edit %s","editing_notes_sections":"Editing Notes and Sections","email":"Email Addresses","email_for_assistance":"If you need assistance, please email us at support@documentcloud.org.","email_when_complete":"Email me when %sdocuments have%s finished processing.","embed_a_note":"Embed a Note","embed_document":"Embed this Document","embed_document_list":"Embed Document List","embed_document_viewer":"Embed Document Viewer","embed_hide_text_tab_help":"If the quality of the document's text is poor, uncheck this box to hide the text tab.","embed_note":"Embed a Note","embed_note_demo_error":"Demo accounts are not allowed to embed notes. %sContact us%s if you need a full featured account. View an example of the embed code %shere%s.","embed_note_step_one":"Step One: Select a Note to Embed","embed_note_step_two":"Step Two: Copy and Paste the Embed Code","embed_search_demo_error":"Demo accounts are not allowed to embed document sets. %sContact us%s if you need a full featured account. View an example of the embed code %shere%s.","embed_search_step_one":"Step One: Configure the Embedded Documents","embed_search_step_two":"Step Two: Copy and Paste the Embed Code","embed_show_sidebar":"Show the sidebar","embed_show_sidebar_help":"If your layout has limited horizontal space, uncheck this box to hide the sidebar.","embed_show_text_tab":"Show the text tab","embed_step_one_title":"Step One: Review \"%s\"","embed_step_three_title":"Step Three: Copy and Paste the Embed Code","embed_step_two_title":"Step Two: Configure the Document Viewer","embed_tools":"Embed Tools","embed_url_of_document":"Most users won't need to add this. URL of the page on your site where this document is embedded","embed_viewer_opens_to":"Viewer opens to","embed_viewer_opens_to_help":"Tell the viewer to open directly to a specific page or annotation.","enter_email_address":"Enter email address","enter_new_password":"Enter your new password","enter_title_and_page":"Please add a title and page number for each section.","enter_url_for_embed":["Enter the URL at which this document is embedded","Enter the URL at which these documents are embedded"],"enter_url_that_references":["Enter the URL of the article that references this document","Enter the URL of the article that references these documents"],"entities_explained":"The entities listed above are present within the documents that match your search. Select an entity to filter your search results.","entities_unavailable":"Entities are temporarily unavailable.","error":"Error","existing_supp_de_claim":"You already have a claim on a document in Data Entry.  Please complete that document or remove your request to auto-assign this one.","explain_disable_account":"%1$s will not be able to log in to DocumentCloud. Public documents and annotations provided by %1$s will remain available. %2$sContact support%3$s to completely purge %1$s's account.","explain_rating_error":"Please leave a note to explain any rating lower than 'Normal'.","export":"Export","export_to_overview_explain":"You are about to export to Overview. You must create an Overview account, and you must provide Overview with your DocumentCloud username and password.","extension":"Extension","extraction":"Extraction","featured_examples_list":"You can find plenty of examples of embedded documents on our list of %sfeatured reporting%s.","featured_reporting_list":"You can find examples of embedded searches on our list of %sfeatured reporting%s.","file_note":"Note","file_uploading":"File Uploading","filter":"Filter","finish":"Finish","first_name":"First name","first_page":"First Page","fixed_size":"Fixed Size","for_example_data":"For example: \u0026ldquo;birth: 1935-01-08\u0026rdquo;, or \u0026ldquo;status: released\u0026rdquo;","force_ocr":"Force OCR","form_contact_instructions":"Use this form (or email to %s) to contact us for assistance. If you need to speak to someone immediately, you can call us at (202) 505-1010. See %s for more ways to get in touch.","freelancer":"Freelancer","full_page":"Full Page","future_documents_w_appear":"Future documents %s will appear in your embed.","group":"Group","groups":"Groups","group_name":"Group Name","group_name_explanation":"A name that will distinctly identify this group.","guided_tour":"Guided Tour","guides_howtos":"Guides \u0026 Howto's","has_no_entities":"%s has no entities to display.","height":"Height","help":"Help","help_pages":"help pages","home":"Home","in_project":"in this project","include_optional_msg":"Optional: Include a personal message","insert_between_pages":"Insert between pages %d and %d","insert_first_page":"Insert before first page","insert_last_page":"Insert after last page","insert_pages_instructions":"To insert new pages at a specific position within the document, click in between the pages above. If you'd like to replace a specific page with a new copy, cick on the page you'd like to remove.","insert_pages_message":"This document will close while it's being rebuilt.  Long documents may take a long time to rebuild.","insert_pages_shift_key":"Hold down the shift key to select multiple pages to replace at once. When you're ready, click the \"Upload Pages\" button.","insert_replace_pages":"Insert/Replace Pages","introduction":"Introduction","language":"Language","language_defaults":"Language Defaults","last_name":"Last name","length":"Length","link_to_pdf":"Link to the original PDF","link_to_pdf_help":"Uncheck this box to remove the PDF link from the document viewer.","log_in":"Log In","log_out":"Log Out","logged_in_as":"Logged in as %s","make_document_public":"Make document public","make_documents_public":["Make document public.","Make %d documents public"],"make_public_on":"Make public on","manage":"Manage","manage_account":"Manage Account","manage_organization":"Manage Organization %s","matching_search":"matching this search","max_upload_size_warn":"You can only upload documents less than 200MB in size. Please %soptimize your document%s before continuing.","mentioned_in_x_documents":["Mentioned in a document","Mentioned in %d documents"],"mentioning_query":"mentioning \u0026ldquo;%s\u0026rdquo;","message":"Message","modification":"modification","modify_original_document":"Modify Original Document","must_have_doc_title":["Please enter a title for the document","Please enter a title for all documents."],"must_have_title":"Please enter a title.","must_upload_something":"You must upload at least one document.","name_explanation":"The name that users will use to reference the template.","new":"New","new_account":"New Account","new_documents":"New Documents","new_project":"New Project","new_subtemplate":"New Subtemplate","new_template":"New Template","next":"Next","no_appear_until_publish":"will not appear until published.","no_dates_for_timeline":["We were unable to recognize any dates for %2$s.","None of the %d documents contained recognizable dates."],"no_duplicate_section":"Can't create a duplicate section.","no_embed_permission":"You don't have permission to embed that document.","no_entities_found":"No entities were found that match your search.","no_past_publication":"You can't set a document to be published in the past.","no_permission_to_edit_x":"You don't have permission to edit \"%s\".","no_project_doc_selected":"No project or documents selected","no_projects_help":"This account doesn't have any projects yet. To start one, click on the \"New Project\" button above.","no_results_for":"No Results for %s","no_reviewer_on_document":["There are no reviewers on this document.","There are no reviewers on these documents."],"no_section_outside_doc":"Can't create a section outside the document.","not_found_account":"This account does not have any documents.","not_found_all":"There are no documents","not_found_annotated":"There are no annotated documents.","not_found_group":"This organization does not have any documents.","not_found_project":"This project does not contain any documents.","not_found_published":"This organization does not have any documents.","not_found_search":"Your search did not match any documents.","note":["Note","Notes"],"note_ellipsis":"Note ...","note_embed_private":"This document is private: notes on this document will not be visible to the public until the document is public.  Change the %saccess level%s now or","notes_hidden_while_redacting":"Any existing notes are temporarily hidden while redaction is taking place.","of":"of","ok":"OK","open":"Open","open_in_viewer":"Open all pages in viewer","open_published":"Open Published Version","open_published_version":"Open Published Version","optional":"Optional","or":"or","or_remove_all_data":"or %sremove all data%s.","order_documents_by":"Order documents by","organization":["Organization"," Organizations"],"organizations_documents":"Documents belonging to %s","over_x_mentions":"Over %d mentions","page":["Page","Pages"],"page_ellipsis":"Page ...","page_tools":"Page Tools","pages_are_being_removed":"The pages are being removed. Please close this document.","paragraph_description_of_document":"Notes regarding this document","password_no_blank":"Your password can't be blank","password_reset":"DocumentCloud password reset","password_updated":"Password updated","pending":"Pending","person":" People","pg":"p.","phone":" Phone","place":"Places","please_enter_email":"Please enter an email address.","please_enter_valid_email":"Please enter a valid email address.","popular":"Popular","popular_documents":"Popular Documents","preview_email":"preview the email message","preview_search_embed_help":"Before continuing, please take a moment to %spreview the document set%s Published documents will open at the URL where they were originally published, while other public documents will open on DocumentCloud.","preview_viewer":"Before continuing, please take a moment to %spreview the document viewer%s.","print_notes":"Print Notes","print_notes_missing_error":"%s does not contain any printable notes.","privacy":"Privacy","private":"Private","private_access":"Private Access","private_access_help":"Only people with explicit permission (via collaboration) have access.","private_documents_visible_instructions":["This document is private. You must make it public before it will be visible on your website or in searches of DocumentCloud's catalog. You can choose to make it public at a future date or you can %2$schange it now%3$s.","These documents are private.  You must make them public before they will be visible on your website or in searches of DocumentCloud's catalog. You can choose to make them public at a future date or you can %2$schange them now%3$s."],"private_note":"Private note","private_note_visible":"This private note is only visible to you.","private_to":"Private to %s","private_to_organization_help":"Only the people in your organization have access. (No freelancers.)","project":"Project","project_exists":"A project named %s already exists","project_id":"Project ID: %s","project_owner":"Project Owner","projectid":"Project ID","projects":"Projects","public":"Public","public_access":"Public Access","public_access_help":"Anyone on the internet can search for and view the document.","public_documents_help":"Select a contributing organization in the list above to view their public documents.","public_on":"Public on","publication_date":"publication date","publish":"Publish","publish_choose_display":"Choose whether to display your document in a %sfull page layout%s or a %sfixed size box%s.","published":"Published","published_documents":"Published Documents","published_url":"Published URL","publishing_embedding":"Publishing \u0026 Embedding","qa_complete_instruct":"Since there are rejection notes attached to this document, it will be returned for supplemental data entry.  Do you want to assign it to yourself?","qa_reject_notes":"Rejection Notes","quality_assurance":"Quality Assurance","quality_control":"Quality Control","reader_workspace_language":"Reader/Workspace Language","really_delete_x_docs":["Really delete document?","Really delete %d documents?"],"red":"red","redact_document":"Redact Document","redact_instructions":"Click and drag to draw a %s rectangle over each portion of the document you'd like to redact. Associated text will be removed when you save your redactions.","redaction_close_while_processing":["You've redacted a passage. This document will close while it's being rebuilt. Are you sure you're ready to proceed?","You've redacted %d passages. This document will close while it's being rebuilt. Are you sure you're ready to proceed?"],"reenable":"Re-enable","reject_de":"Reject Data Entry","reject_de_both":"Both Data Entry Users","reject_de_not_selected":"You have not selected a user to reject.","reject_de_text":"Please choose which data entry user's work you would like to reject. This user's work and all current QC work will be deleted.","reject_point":"Reject Data Point","reject_point_explanation":"Please enter a rejection reason.","related_article_url":"Source Reference","related_article_url_help":"Providing the URL of the article that references this document will enable a \"Related Article\" link within the document viewer. Many readers arrive at a document from a web search \u0026mdash; the link guides them back to the document's original context.","related_url_of_document":"Reference for this source (usually a URL)","relevance":"Relevance","remove":"Remove","remove_all":"Remove All","remove_entity":"remove this entity from your search","remove_file":"Remove file","remove_from_project":"Remove from this Project","remove_line_breaks":"Remove line breaks","remove_page_warning_message":["You've selected a page for removal. This document will close while it's being rebuilt. Are you sure you're ready to proceed?","You've selected %d pages for removal. This document will close while it's being rebuilt. Are you sure you're ready to proceed?"],"remove_pages":"Remove Pages","remove_pages_click":"Click on each page you want to remove from this document.","remove_pages_done":"When you're finished selecting pages, click the \"Remove Pages\" button.","remove_pages_input":["Remove Page","Remove %d Pages"],"removed_from_x_documents":["Removed a document from %s","Removed %d documents from %s"],"removing":"Removing...","reorder_hint":"Reorder pages by dragging and dropping.","reorder_pages":"Reorder Pages","reorder_pages_done":"When you're finished rearranging, click on the \"Save Page Order\" button to save your changes.","reorder_pages_instructions":"Drag and drop pages to change their position in the document.","replace_multiple_pages":"Replace pages between %d and %d","replace_page_x":"Replace page %d","reprocess":"Reprocess","reprocess_text":"Reprocess Text","request_supp_work":"Request Supplemental Work","resend_instructions":"Resend Instructions","resend_welcome_email":"Resend Welcome Email","restricted":"Restricted","review_de_instruct":"Please review the Data Entry work for each user.","review_qc_instruct":"Please review the Quality Control work.","review_x_documents":["Review \"%2$s\" on DocumentCloud","Review %d documents on DocumentCloud"],"reviewer":"Reviewer","reviewer_add_permission_denied":"You are not allowed to add reviewers.","reviewer_email_instructions":["Email Instructions to %2$s","Email Instructions to %d Reviewers"],"reviewer_email_message":"DocumentCloud will email reviewing instructions to %s If you wish, you may add a personal message.","reviewer_enter_email":"Enter the email address of the first reviewer to invite:","reviewer_name":"Please provide the reviewer's name","reviewer_remove_error":"There was a problem removing the reviewer.","reviewer_remove_permission_denied":"You are not allowed to remove reviewers.","reviewing_instructions_multiple_sent_to":"Instructions for reviewing %d Documents sent to %s","reviewing_instructions_send_failure":"Your instructions were not sent. Contact support for help troubleshooting.","reviewing_instructions_single_sent_to":"Instructions for reviewing %s sent to %s","revoke":"Revoke","role_administrator_for_x":"You are an administrator for \n","role_contributor_for_x":"You are a contributor for %s","role_data_entry_for_x":"You are a Data Entry user for %s","role_freelancer_for_x":"You are a freelancer for %s","role_reviewer_for_x":"You are a reviewer for %s","save":"Save","save_as_draft":"Save as Draft","save_page_order":"Save Page Order","save_redactions":"Save Redactions","save_text":"Save Text","saved":"Saved","search":"Search","search_bar":"Search Bar","searching_dd":"Searching Documents and Data","select_pages_remove":"Select the pages you wish to remove.","select_single_to_embed":"Please select a single document in order to create the embed.","select_single_to_open":"Please select a document to open.","select_with_public_note":"Please select a document with at least one public note.","send":"Send","sending":"Sending...","set_access":"Set Access Level","set_publication_date":"Set Publication Date","set_publication_date_for":"Set publication date for %s","set_the":"set the","set_will_appear":"will appear in this set.","share_documents":"Share these Documents","share_project":"Share this Project","share_x_documents":["Share this Document","Share these Documents"],"shared_with_you_by":"Shared with you by %s","sharing_x_of_x_documents":"Sharing %d/%d documents","show_all":"Show all","show_all_x_pages":["Show single page","Show all %d pages"],"show_less":"Show less","show_more":"Show more","show_pages":"show pages","signup_sent_to":"Signup sent to %s","sort":"Sort","sort_by_date_uploaded":"Sort by Date Uploaded","sort_by_length":"Sort by Length","sort_by_relevance":"Sort by Relevance","sort_by_source":"Sort by Source","sort_by_title":"Sort by Title","sort_documents_by":"Sort Documents By","source":"Source Type","source_of_document":"The type of source that classifies this document","state":" States","status":"Status","step_x_of_x":"Step %d of %d","study":"Study","study_of_document":"The study this file pertains to","template_fields":"Template Fields","template_name":"Template Name","template_name_invalid":"The template name you entered is invalid.","template_name_required":"The template name is required.","templates":"Templates","term":" Terms","terms":"Terms","text":"Text","text_reprocess_help":"\"Reprocess\" this document to take advantage of improvements to our text extraction tools. Choose \"Force OCR\" (optical character recognition) to ignore any embedded text information and use Tesseract before reprocessing. The document will close while it's being rebuilt. Are you sure you want to proceed?","text_tools":"Text Tools","the_api":"The DocumentCloud API","timeline_for_doc":"Timeline for \"%s\"","timeline_for_x_docs":"Timeline for %d documents","timeline_max_documents":"You can only view a timeline for ten documents at a time.","timeline_must_select":"In order to view a timeline, please select some documents.","timeline_zoom_in":"Drag a range of dates to zoom in.","title":"Title","title_of_document":"Title of this document","tools_help":"Our %s can help you get the most out of our %s and %s tools.","troubleshooting_uploads":"Troubleshooting Failed Uploads","unpublished":"Unpublished","update_applied_all":"Update applied to all files.","upload":"Upload","upload_document":"Upload Document","upload_pages":"Upload Pages","uploaded_x_document_has":["the uploaded document has","the %d uploaded documents have"],"uploaded_x_documents":["Uploaded one Document","Uploaded %d Documents"],"uploading":"Uploading","uploading_documents":"Uploading Documents","uservoice_discuss":"Discuss Features \u0026amp; Bugs","view_entities":"View Entities","view_pages":"View Pages","view_timeline":"View Timeline","welcome_message_sent_to":"A welcome message has been sent to %s.","welcome_to_document_cloud":"Welcome to DocumentCloud","width":"Width","workspace":"Workspace","x_accounts":["%d account","%d accounts"],"x_collaborators":["One Collaborator","%d Collaborators"],"x_documents":["%d Document","%d Documents"],"x_has_documents":"%s Documents","x_invited_to_review_x":"%s has invited you to review %s","x_is_no_longer_a_reviewer_on_x":["%2$s is no longer a reviewer on the Document","%2$s is no longer a reviewer on the %1$d Documents"],"x_is_not_published":"\"%s\" is not published.","x_mentions":["One Mention","%d Mentions"],"x_notes":["%d Note","%d Notes"],"x_pages":["%d Page","%d Pages"],"x_private_documents":["%d Private Document","%d Private Documents"],"x_public_documents":["%d Public Document","%d Public Documents"],"x_results":["%d Result","%d Results"],"x_still_processing":"\"%s\" is still being processed. Please wait for it to finish.","your_documents":"Your Documents","your_organization":"Your Organization","your_published_documents":"Your Published Documents","youve_been_added_to_x":"You have been added to %s","zoom_out":"Zoom Out"}

});
