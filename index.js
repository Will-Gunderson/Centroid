document.addEventListener('DOMContentLoaded', function () {

    // Function to initialize floor plan filters and handle enabling/disabling links
    function setupFloorPlanFilters() {
        // Floor Plan Filtering
        var floorPlanCounts = {};

        // Count the number of units available for each floor plan type
        document.querySelectorAll('.collection-item').forEach(function (item) {
            var unitElement = item.querySelector('.unit');
            if (unitElement && !unitElement.classList.contains('w-condition-invisible')) {
                var floorPlanType = item.getAttribute('data-floor-plan');
                if (!floorPlanCounts[floorPlanType]) {
                    floorPlanCounts[floorPlanType] = 0;
                }
                floorPlanCounts[floorPlanType]++;
            }
        });

        console.log('Floor plan counts:', floorPlanCounts);

        // Select all floor plan links (Debugging step)
        var floorPlanLinks = document.querySelectorAll('.floor-plan-image-link');
        console.log('Floor Plan Links Found:', floorPlanLinks); // Log the links to see if they're found

        if (floorPlanLinks.length === 0) {
            console.error('No floor plan links found with class .floor-plan-image-link');
        }

        // Enable or disable floor plan links based on the number of available units for each floor plan
        floorPlanLinks.forEach(function (link) {
            var filterValue = link.getAttribute('data-floor-plan');

            if (filterValue === 'all') {
                link.classList.remove('disabled');
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';

                // Ensure the "All" link is active by default
                link.classList.add('active');
            } else {
                if (!floorPlanCounts[filterValue] || floorPlanCounts[filterValue] === 0) {
                    link.classList.add('disabled');
                    link.style.pointerEvents = 'none';
                    link.style.opacity = '0.5';
                } else {
                    link.classList.remove('disabled');
                    link.style.pointerEvents = 'auto';
                    link.style.opacity = '1';
                }
            }
        });

        // Event listener for floor plan filter links
        floorPlanLinks.forEach(function (link) {
            if (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    var filterValue = link.getAttribute('data-floor-plan');
                    var selector = filterValue === 'all' ? 'all' : `[data-floor-plan="${filterValue}"]`;

                    console.log('Filtering by floor plan selector:', selector);

                    // Filter units and floor plan images by the selected floor plan
                    filterUnitsByFloorPlan(filterValue);

                    // Remove the active class from all floor plan links and add it to the clicked one
                    floorPlanLinks.forEach(function (btn) {
                        btn.classList.remove('active');
                    });
                    link.classList.add('active');
                });
            } else {
                console.error('Link element is null. Cannot add event listener.');
            }
        });
    }

    // Function to filter the units and floor plan images based on the selected floor plan
    function filterUnitsByFloorPlan(floorPlan) {
        // Filter units in the collection
        const unitItems = document.querySelectorAll('.collection-item'); // Adjust the selector to your CMS collection class
        unitItems.forEach(item => {
            const unitFloorPlan = item.getAttribute('data-floor-plan');

            if (floorPlan === 'all' || unitFloorPlan === floorPlan) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Filter floor plan images
        const floorPlanImages = document.querySelectorAll('.floor-plan-image'); // Adjust the selector to your floor plan images
        floorPlanImages.forEach(image => {
            const imageFloorPlan = image.getAttribute('data-floor-plan');

            if (floorPlan === 'all' || imageFloorPlan === floorPlan) {
                image.style.display = 'block';
            } else {
                image.style.display = 'none';
            }
        });
    }

    // Initialize all functionality
    function init() {
        setupFloorPlanFilters();  // Initialize floor plan filtering
    }

    // Initialize all functionality on DOMContentLoaded
    init();
});