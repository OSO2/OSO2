'use strict';

function tab_initialize_solution_module(status) {
    OSO.requestCode("view");
    $('#content').load("./tabs/solution.html", function () {
        if (GUI.active_tab != 'solution') {
            GUI.active_tab = 'solution';
            googleAnalytics.sendAppView('Solution');
        }

        // translate to user-selected language
        localize();

        
    });
}