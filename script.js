// Load Monaco Editor
require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.33.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    console.log('Monaco Editor loaded successfully!');

    // Initialize the editor
    const editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: `{
    "type": "FeatureCollection",
    "features": []
}`, // Default GeoJSON
        language: 'json', // Set language to JSON
        theme: 'vs-dark', // Use a dark theme
        automaticLayout: true // Automatically resize the editor
    });

    console.log('Editor initialized successfully!');

    // Initialize Leaflet Map
    const map = L.map('map').setView([0, 0], 2); // Center the map at [0, 0] with zoom level 2
    console.log('Leaflet map initialized successfully!');

    // Add a tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    console.log('Tile layer added successfully!');

    // Add a GeoJSON layer (empty for now)
    let geojsonLayer = L.geoJSON().addTo(map);
    console.log('Empty GeoJSON layer added successfully!');

    // Function to render GeoJSON on the map
    function renderGeoJSON(geojson) {
        try {
            console.log('Parsing GeoJSON...');
            const parsedGeoJSON = JSON.parse(geojson);
            console.log('GeoJSON parsed successfully:', parsedGeoJSON);

            // Remove the old GeoJSON layer (if any)
            if (geojsonLayer) {
                map.removeLayer(geojsonLayer);
                console.log('Old GeoJSON layer removed.');
            }

            // Add the new GeoJSON layer to the map
            geojsonLayer = L.geoJSON(parsedGeoJSON).addTo(map);
            console.log('New GeoJSON layer added successfully!');

            // Fit the map to the bounds of the GeoJSON
            map.fitBounds(geojsonLayer.getBounds());
            console.log('Map fitted to GeoJSON bounds.');
        } catch (error) {
            console.error('Invalid GeoJSON:', error);
            alert('Invalid GeoJSON! Please check your input.');
        }
    }

    // Add a button to trigger preview
    document.getElementById('preview-button').addEventListener('click', function () {
        console.log('Preview button clicked!');
        const geojson = editor.getValue(); // Get the GeoJSON from the editor
        renderGeoJSON(geojson);
    });

    // Add a button to load GeoJSON from URL
    document.getElementById('load-url-button').addEventListener('click', function () {
        console.log('Load URL button clicked!');
        const url = document.getElementById('geojson-url').value; // Get the URL from the input

        if (!url) {
            alert('Please enter a valid URL.');
            return;
        }

        // Fetch GeoJSON from the URL
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(geojson => {
                console.log('GeoJSON fetched successfully:', geojson);
                // Update the editor with the fetched GeoJSON
                editor.setValue(geojson);
                // Render the GeoJSON on the map
                renderGeoJSON(geojson);
                // Collapse the editor section
                collapseSection(document.querySelector('.editor-section'));
            })
            .catch(error => {
                console.error('Error fetching GeoJSON:', error);
                alert('Failed to load GeoJSON from the URL. Please check the URL and try again.');
            });
    });

    // Collapsible Sections
    const collapsibleSections = document.querySelectorAll('.collapsible');
    collapsibleSections.forEach(section => {
        const header = section.querySelector('.section-header');
        const collapseButton = section.querySelector('.collapse-button');

        header.addEventListener('click', function () {
            section.classList.toggle('collapsed');
            // Update button text
            if (section.classList.contains('collapsed')) {
                collapseButton.textContent = 'Expand';
            } else {
                collapseButton.textContent = 'Collapse';
            }
        });
    });

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode');
    darkModeToggle.addEventListener('change', function () {
        document.body.classList.toggle('light-mode', !this.checked);
        // Update Monaco Editor theme
        const theme = this.checked ? 'vs-dark' : 'vs';
        monaco.editor.setTheme(theme);
    });

    // Function to collapse a section
    function collapseSection(section) {
        section.classList.add('collapsed');
        const collapseButton = section.querySelector('.collapse-button');
        if (section.classList.contains('collapsed')) {
            collapseButton.textContent = 'Expand';
        } else {
            collapseButton.textContent = 'Collapse';
        }
    }
});

window.onload = function() {
    document.getElementById("geojson-url").value = "https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/refs/heads/master/Hyderabad/ghmc-area.geojson";
    
    // Simulate button click
    setTimeout(() => {
        document.getElementById("load-url-button").click();
    }, 500); // Delay for better UX
};