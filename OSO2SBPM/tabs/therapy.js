'use strict';

function tab_initialize_therapy_module(status) {
    //OSO.requestCode("view");
    $('#content').load("./tabs/therapy.html", function () {
        if (GUI.active_tab != 'therapy') {
            GUI.active_tab = 'therapy';
            googleAnalytics.sendAppView('Therapy');
        }

        // translate to user-selected language
        localize();

        
    });
}