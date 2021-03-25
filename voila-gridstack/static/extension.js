/*
 * Copyright (c) 2018, Voila Contributors
 * Copyright (c) 2018, QuantStack
 *
 * Distributed under the terms of the BSD 3-Clause License.
 *
 * The full license is in the file LICENSE, distributed with this software.
 */


define(['jquery',
        'base/js/namespace',
        'nbextensions/voila-gridstack/gridstack-jq',
        'nbextensions/voila-gridstack/voila-gridstack'
       ],
       function($, Jupyter, gridstack, voila_gridstack) {

    var GRIDSTACK_STYLES = 'https://cdn.jsdelivr.net/npm/gridstack@4.0.1/dist/gridstack.min.css';
    var grid;

    function load_ipython_extension() {

        // import gridstack styles
        $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', GRIDSTACK_STYLES) );

        /*
         * Cancel gridstack view and go back to usual notebook view
         */
        var close_voila_gridstack = function() {

            // disables button
            $('#btn-voila-gridstack_notebook').prop( "disabled", true );

            // unsubsribe from events
            grid.off('added');
            grid.off('change');
            grid.off('removed');
            grid.off('resizestop');

            // saves notebook then formats HTML
            Jupyter.notebook.save_notebook().then(function () {

                // sets notebook to normal width and shows inputs and prompt
                $('#notebook-container').css('width', '');
                $('.code_cell > .input').show();
                $('.prompt').show();
                $('div.output_subarea').css('max-width', '');

                // removes handles
                $('.gridhandle').remove();

                // unwraps cells, and removes remaining GridStack elements
                $('.grid-stack').contents().unwrap();
                $('.grid-stack-item-content').siblings().remove();
                $('.grid-stack-item-content').unwrap();
                $('.grid-stack-item-content').contents().unwrap();
                $('style[gs-style-id]').remove();

                // Remove CSS files
                $("head").children("#voila-gridstack-styles").remove();

                // fake window resize event to resize bqplot to notebook width
                window.dispatchEvent(new Event('resize'));

                // enables button for gristack view
                $('#btn-voila-gridstack_gridstack').prop( "disabled", false );
            });
        }

        /*
         * Open Gridstack view with handles in Jupyter environment
         */
        var open_voila_gridstack = function() {

            // disables button
            $('#btn-voila-gridstack_gridstack').prop( "disabled", true );

            // hide notebook contents during init
            $('#site').hide();

            // appends voila-gridstack styles and a loading spinner
            $("head").append("<link id='voila-gridstack-styles' href='/nbextensions/voila-gridstack/voila-gridstack.css' type='text/css' rel='stylesheet' />").ready( function () {
                $('#site').after(`
                    <div id="loading">
                        <div class="spinner-container">
                          <svg class="spinner" data-name="c1" version="1.1" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><metadata><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title>voila</dc:title></cc:Work></rdf:RDF></metadata><title>spin</title><path class="voila-spinner-color1" d="m250 405c-85.47 0-155-69.53-155-155s69.53-155 155-155 155 69.53 155 155-69.53 155-155 155zm0-275.5a120.5 120.5 0 1 0 120.5 120.5 120.6 120.6 0 0 0-120.5-120.5z"/><path class="voila-spinner-color2" d="m250 405c-85.47 0-155-69.53-155-155a17.26 17.26 0 1 1 34.51 0 120.6 120.6 0 0 0 120.5 120.5 17.26 17.26 0 1 1 0 34.51z"/></svg>
                        </div>
                        <h2 id="loading_text">Running...</h2>
                    </div>
                `);
            });

            // executes all cells
            Jupyter.notebook.execute_all_cells();

            // waits for all cells executed
            voila_gridstack.wait_for_all_cells_executed().then(function () {
                // then init metadata
                voila_gridstack.init_metadata();

                // saves notebook with metadata, then formats HTML
                Jupyter.notebook.save_notebook().then(function () {

                    try {
                        var active_view_name = Jupyter.notebook.metadata.extensions.jupyter_dashboards.activeView;
                        var active_view = Jupyter.notebook.metadata.extensions.jupyter_dashboards.views[active_view_name];
                    }
                    catch(err) {
                        console.error('Error during gridstack initialization\n', err);
                    }

                    // hide inputs and prompts
                    $('#notebook-container').css('width', '100%');
                    $('.code_cell > .input').hide();
                    $('.prompt').hide();

                    // remove unused space on right-hand side of widgets
                    $('div.output_subarea').css('max-width', '100%');

                    // wraps each notebook cell in a grid-stack-item-content div, and adds handles
                    $('.cell').wrap("<div class='grid-stack-item-content'></div>");
                    $('.grid-stack-item-content').prepend(`
                        <div class="gridhandle">
                            <i class="fa"></i>
                        </div>
                    `);

                    // wraps each grid-stack-item-content div in a grid-stack-item div, including position and size
                    $('.grid-stack-item-content').wrap(function() {

                        cell = $(this).find(".cell").first().data('cell');

                        try {
                            gridstack_meta = cell.metadata.extensions.jupyter_dashboards.views[active_view_name];
                        }
                        catch(err) {
                            console.error('Error during gridstack initialization\n', err);
                        }

                        position = (!gridstack_meta.hasOwnProperty('col')) ?
                                        "gs-auto-position='true'" :
                                        "gs-x='" + gridstack_meta.col + "' gs-y='" + gridstack_meta.row + "'";

                        width = (!gridstack_meta.hasOwnProperty('width')) ? "12" : gridstack_meta.width;

                        height = (!gridstack_meta.hasOwnProperty('height')) ? "2" : gridstack_meta.height;

                        return `<div class='grid-stack-item'
                                 ${position}
                                 gs-w='${width}'
                                 gs-h='${height}'></div>`;
                    });

                    // wrap all grid-stack-item divs in a grid-stack div
                    $('.grid-stack-item').wrapAll("<div class='grid-stack'></div>");

                    // init GridStack
                    grid = gridstack.init({
                        float: true,
                        alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                        resizable: {
                            handles: 'e, se, s, sw, w',
                            autoHide: true
                        },
                        cellHeight: active_view.defaultCellHeight,
                        margin: active_view.cellMargin,
                        column: active_view.maxColumns,
                        draggable: {
                            handle: '.gridhandle'
                        }
                    });

                    //  bqplot doesn't resize when resizing the tile, fix: fake a resize event
                    grid.on('resizestop', function(event, elem) {
                        window.dispatchEvent(new Event('resize'));
                    });

                    // adds 'on change' listener on grid to save position and size in metadata
                    voila_gridstack.init_on_change(grid);

                    // fake window resize event at init to display bqplot without resizing tile
                    window.dispatchEvent(new Event('resize'));


                    // saves initial positions and sizes in metadata
                    $('.grid-stack').trigger("change", grid.engine.nodes);
                });

                // removes spinner and show notebook as gridstack
                $('#loading').remove();
                $('#site').show();

                // enables button to go back to notebook view
                $('#btn-voila-gridstack_notebook').prop( "disabled", false );

            });
        }

        /*
         * Open voila-gridstack in a new window
         */
        var open_voila_dashboard = function() {
            // saves notebook then call URL from server_extension
            Jupyter.notebook.save_notebook().then(function () {
                let voila_dashboard_url = Jupyter.notebook.base_url + "voila/dashboard/" + Jupyter.notebook.notebook_path;
                window.open(voila_dashboard_url);
            });
        }

        // Registers icon which go back to notebook
        var action_notebook = {
            icon    : 'fa-code', // a font-awesome class used on buttons, etc
            help    : 'Back to notebook',
            handler : close_voila_gridstack
        };
        var prefix = 'notebook';
        var full_action_notebook = Jupyter.actions.register(action_notebook, 'close-voila-gridstack', prefix);

        // Registers icon which show grid-stack with handles in Jupyter environment
        var action_gridstack = {
            icon    : 'fa-th', // a font-awesome class used on buttons, etc
            help    : 'Voila-gridstack',
            handler : open_voila_gridstack
        };
        var prefix = 'voila-gridstack';
        var full_action_gridstack = Jupyter.actions.register(action_gridstack, 'open-voila-gridstack', prefix);

        // Registers icon which open voila-gridstack
        var action_dashboard = {
            icon    : 'fa-dashboard', // a font-awesome class used on buttons, etc
            help    : 'Voila-dashboard',
            handler : open_voila_dashboard
        };
        var prefix = 'voila-dashboard';
        var full_action_dashboard = Jupyter.actions.register(action_dashboard, 'open-voila-dashboard', prefix);

        // adds buttons in Jupyter header
        Jupyter.toolbar.add_buttons_group([{action: full_action_notebook, id: 'btn-voila-gridstack_notebook'},
                                           {action: full_action_gridstack, id: 'btn-voila-gridstack_gridstack'},
                                           full_action_dashboard],
                                           'btn-voila-gridstack');

        // disables button to notebook view, as this is the default view
        $('#btn-voila-gridstack_notebook').prop( "disabled", true );
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
