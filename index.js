document.addEventListener('DOMContentLoaded', function () {

    // URL and Navigation Functions

    // Retrieves the last segment of the URL path, typically used to get the unit slug (e.g., "406" from "/studios/e1/406").
    function getActiveUnitSlug() {
        var urlPath = window.location.pathname;
        var pathSegments = urlPath.split('/');
        return pathSegments[pathSegments.length - 1];
    }

    // Retrieves the second-to-last segment of the URL path, used to get the unit type (e.g., "e1" from "/studios/e1/406").
    function getUnitType() {
        var urlPath = window.location.pathname;
        var pathSegments = urlPath.split('/');
        return pathSegments.length > 1 ? pathSegments[pathSegments.length - 2] : null;
    }

    // Scroll Position Functions

    // Saves the current scroll position of an element (typically a sidebar) to localStorage.
    function saveScrollPosition() {
        var centroidSidebar = document.querySelector('.centroid-sidebar');
        if (centroidSidebar) {
            localStorage.setItem('scrollTop', centroidSidebar.scrollTop);
            localStorage.setItem('scrollLeft', centroidSidebar.scrollLeft);
            console.log('Scroll position saved:', centroidSidebar.scrollTop, centroidSidebar.scrollLeft);
        }
    }

    // Restores the scroll position from localStorage if it hasn't been cleared or reset due to a unit type change.
    function restoreScrollPosition() {
        var centroidSidebar = document.querySelector('.centroid-sidebar');
        var scrollTop = localStorage.getItem('scrollTop');
        var scrollLeft = localStorage.getItem('scrollLeft');
        if (centroidSidebar && !hasUnitTypeChanged()) {
            if (scrollTop !== null) centroidSidebar.scrollTop = scrollTop;
            if (scrollLeft !== null) centroidSidebar.scrollLeft = scrollLeft;
            console.log('Scroll position restored:', centroidSidebar.scrollTop, centroidSidebar.scrollLeft);
        }
    }

    // Determines the scroll direction based on the scroll position of the sidebar (returns "vertical" or "horizontal").
    function getScrollDirection() {
        var centroidSidebar = document.querySelector('.centroid-sidebar');
        if (centroidSidebar) {
            var scrollTop = centroidSidebar.scrollTop;
            var scrollLeft = centroidSidebar.scrollLeft;
            return (scrollTop > 0 || scrollLeft > 0) ? 'vertical' : 'horizontal';
        }
        return null;
    }

    // Unit Type Functions

    // Checks if the unit type has changed by comparing the current unit type to what is stored in localStorage.
    function hasUnitTypeChanged() {
        var currentUnitType = getUnitType();
        var previousUnitType = localStorage.getItem('unitType');
        return currentUnitType !== previousUnitType;
    }

    // Saves the current unit type in localStorage.
    function saveUnitType() {
        var currentUnitType = getUnitType();
        localStorage.setItem('unitType', currentUnitType);
    }

    // Sort State Functions

    // Saves the active sort field and sort order (e.g., "price" and "asc" or "desc") to localStorage.
    function saveSortState(sortField, sortOrder) {
        localStorage.setItem('activeSortField', sortField);
        localStorage.setItem('activeSortOrder', sortOrder);
    }

    // Retrieves the saved sort state (field and order) from localStorage.
    function getSavedSortState() {
        return {
            field: localStorage.getItem('activeSortField'),
            order: localStorage.getItem('activeSortOrder')
        };
    }

    // Clears the saved sort state from localStorage.
    function clearSortState() {
        localStorage.removeItem('activeSortField');
        localStorage.removeItem('activeSortOrder');
    }

    // Mobile Adjustment Function

    // Adjusts unit links for mobile by appending "#mix-container" to links if they don’t already have it.
    function adjustLinksForMobile() {
        if (window.innerWidth <= 767) {
            document.querySelectorAll('.unit').forEach(function (link) {
                const href = link.getAttribute('href');
                if (!href.includes('#mix-container')) {
                    const newHref = href + '#mix-container';
                    link.setAttribute('href', newHref);
                }
            });
        }
    }

    // Formatting Functions

    // Formats a number as currency without decimal places (e.g., $1000 instead of $1000.00).
    function formatAsCurrencyWithoutCents(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }

    // Determines the correct suffix for a day (e.g., "st" for 1st, "nd" for 2nd).
    function getDaySuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    // Formats a date string as "MMM Dth" (e.g., "Jan 1st").
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short' };
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', options);
        const daySuffix = getDaySuffix(day);
        return `${month} ${day}${daySuffix}`;
    }

    // Parses a date string into a Date object.
    function parseDate(dateStr) {
        if (!dateStr) return null;
        var date = new Date(dateStr);
        return date;
    }

    // Categorizes the available date into "now", "thirtydays", "sixtydays", or "ninetydays".
    function categorizeDate(availableDate) {
        var today = new Date();
        var dayDifference = Math.floor((availableDate - today) / (1000 * 60 * 60 * 24));

        if (dayDifference <= 30) {
            return 'now';
        } else if (dayDifference > 30 && dayDifference <= 60) {
            return 'thirtydays';
        } else if (dayDifference > 60 && dayDifference <= 90) {
            return 'sixtydays';
        } else if (dayDifference > 90) {
            return 'ninetydays';
        } else {
            return null; // Or handle accordingly
        }
    }

    // Sort and Filter Function

    // Initializes MixItUp filtering and sorting, as well as saving/restoring sort state.
    function initializeSortAndFilterButtons() {
        var containerEl = document.querySelector('#mix-container');

        if (containerEl) {
            var mixer = mixitup(containerEl);

            // Apply saved sort state if it exists and unit type hasn't changed
            if (!hasUnitTypeChanged()) {
                var savedSort = getSavedSortState();
                if (savedSort.field && savedSort.order) {
                    var sortString = `${savedSort.field}:${savedSort.order}`;
                    mixer.sort(sortString);
                    updateSortButtonsState(savedSort.field, savedSort.order);
                }
            }

            // Categorize collection items based on their available date and handle disabled/enabled state for filter buttons
            var categoryCounts = {
                now: 0,
                thirtydays: 0,
                sixtydays: 0,
                ninetydays: 0,
            };

            document.querySelectorAll('.collection-item').forEach(function (item) {
                var availableDateStr = item.getAttribute('data-available-date');
                var unitElement = item.querySelector('.unit');

                if (availableDateStr && unitElement && !unitElement.classList.contains('w-condition-invisible')) {
                    var availableDate = parseDate(availableDateStr);
                    if (availableDate && !isNaN(availableDate)) {
                        var category = categorizeDate(availableDate);
                        item.setAttribute('data-category', category);
                        categoryCounts[category]++;
                    }
                }
            });

            // Event listener for filter buttons (e.g., Move-In links)
            document.querySelectorAll('.dropdown-link').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    var filterValue = link.getAttribute('data-filter');
                    var selector = filterValue === 'all' ? 'all' : `[data-category="${filterValue}"]`;

                    mixer.filter(selector).then(function (state) {
                        console.log('Filter applied. Showing:', state.totalShow);
                    }).catch(function (error) {
                        console.error('Filter application error:', error);
                    });

                    document.querySelectorAll('.dropdown-link').forEach(function (btn) {
                        btn.classList.remove('active');
                    });
                    link.classList.add('active');
                });
            });

            // Floor Plan Filtering
            var floorPlanCounts = {};
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

            // Enable or disable floor plan links based on the number of available units for each floor plan
            document.querySelectorAll('.floor-plan-link').forEach(function (link) {
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
            document.querySelectorAll('.floor-plan-link').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    var filterValue = link.getAttribute('data-floor-plan');
                    var selector = filterValue === 'all' ? 'all' : `[data-floor-plan="${filterValue}"]`;
                    console.log('Filtering by floor plan selector:', selector);

                    mixer.filter(selector).then(function (state) {
                        console.log('Floor plan filter applied. Total items shown:', state.totalShow);
                    }).catch(function (error) {
                        console.error('Error applying floor plan filter:', error);
                    });

                    // Remove the active class from all floor plan links and add it to the clicked one
                    document.querySelectorAll('.floor-plan-link').forEach(function (btn) {
                        btn.classList.remove('active');
                    });
                    link.classList.add('active');
                });
            });

            // Event listener for sort buttons
            document.querySelectorAll('.sort-link').forEach(function (button) {
                button.addEventListener('click', function (e) {
                    e.preventDefault();

                    var sortField = this.getAttribute('data-sort').split(':')[0];
                    var currentOrder = this.getAttribute('data-order') || 'asc';
                    var newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                    var newSortString = `${sortField}:${newOrder}`;

                    mixer.sort(newSortString);
                    updateSortButtonsState(sortField, newOrder);
                    saveSortState(sortField, newOrder);
                    saveScrollPosition();
                });
            });
        } else if (document.body.classList.contains('favorites')) {
            console.log('Favorites page detected. Skipping MixItUp initialization.');
        } else {
            console.error('MixItUp container not found!');
        }
    }

    // Updates the state of the sort buttons to show the active sorting field and direction (ascending or descending)
    function updateSortButtonsState(sortField, sortOrder) {
        document.querySelectorAll('.sort-link').forEach(function (btn) {
            var btnSortField = btn.getAttribute('data-sort').split(':')[0];
            btn.classList.toggle('active', btnSortField === sortField);
            btn.setAttribute('data-order', sortField === btnSortField ? sortOrder : 'asc');
            var arrow = btn.querySelector('.arrow');
            if (arrow) {
                arrow.classList.toggle('asc', sortOrder === 'asc');
                arrow.classList.toggle('desc', sortOrder === 'desc');
            }
        });
    }

    // Knock Button Functions

    // Sets up click listeners for custom buttons (e.g., for contacting or scheduling) that trigger external "knock" actions
    function setupKnockButtons() {
        const knockButtons = [
            { selector: '.knock-contact, .utility-nav.contact', action: 'openContact' },
            { selector: '.knock-schedule', action: 'openScheduling' }
        ];

        knockButtons.forEach(knock => {
            document.querySelectorAll(knock.selector).forEach(button => {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (knockDoorway && typeof knockDoorway[knock.action] === 'function') {
                        knockDoorway[knock.action]();
                    } else {
                        console.error(`Action ${knock.action} is not a function on knockDoorway`);
                    }
                });
            });
        });
    }

    // Unit Visited Functions

    // Updates the state of the "visited" status for a specific unit link based on whether it's been marked as visited
    function updateVisitedState(unitLink) {
        let unitSlug = unitLink.closest('[data-slug]').getAttribute('data-slug');
        let eyeIcon = unitLink.querySelector('.eye-wrapper .eye');

        if (Cookies.get(`visited_${unitSlug}`) === "true") {
            eyeIcon.classList.add('visited');
        } else {
            eyeIcon.classList.remove('visited');
        }
    }

    // Marks the current unit as visited by setting a cookie for that unit
    function setActiveUnitAsVisited() {
        const pathSegments = window.location.pathname.split('/');
        const currentUnitSlug = pathSegments[pathSegments.length - 1];
        const activeUnitElement = document.querySelector(`[data-slug="${currentUnitSlug}"]`);

        if (activeUnitElement) {
            Cookies.set(`visited_${currentUnitSlug}`, "true", { expires: 365 });
            const eyeIcon = activeUnitElement.querySelector('.eye-wrapper .eye');
            if (eyeIcon) {
                eyeIcon.classList.add('visited');
            }
        }
    }

    // Sets up event listeners on unit links and updates their visited state on click
    function setupUnitLinks() {
        document.querySelectorAll('a.unit').forEach(link => {
            updateVisitedState(link);

            link.addEventListener('click', function (event) {
                let unitSlug = this.closest('[data-slug]').getAttribute('data-slug');
                Cookies.set(`visited_${unitSlug}`, "true", { expires: 365 });
                updateVisitedState(this);
            });
        });
    }

    // Favorite Functions

    // Updates the state of the favorite icons for a specific item (hearts) based on whether it is favorited
    function updateFavoritedState(itemId) {
        let isFavorited = Cookies.get(`favorited_${itemId}`) === "true";
        console.log('Updating favorite state for item:', itemId, 'Favorited:', isFavorited);

        document.querySelectorAll(`.heart-wrapper[data-id="${itemId}"]`).forEach(wrapper => {
            let hearts = wrapper.querySelectorAll('.heart, .mainheart');
            hearts.forEach(heart => {
                if (isFavorited) {
                    heart.classList.add('selected');
                } else {
                    heart.classList.remove('selected');
                }
            });

            // If on the favorites page, update visibility
            if (document.body.classList.contains('favorites')) {
                let collectionItem = wrapper.closest('.collection-item.mix');
                if (collectionItem) {
                    if (isFavorited) {
                        collectionItem.classList.remove('hide');
                        collectionItem.style.display = '';
                    } else {
                        collectionItem.classList.add('hide');
                        collectionItem.style.display = 'none';
                    }
                }
            }
        });
    }

    // Sets up event listeners on favorite buttons (hearts) and updates their favorited state on click
    function setupHeartWrappers() {
        document.querySelectorAll('.heart-wrapper').forEach(heartWrapper => {
            let itemId = heartWrapper.getAttribute('data-id');
            updateFavoritedState(itemId);

            heartWrapper.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                let itemId = this.getAttribute('data-id');
                let isFavorited = Cookies.get(`favorited_${itemId}`) === "true";

                Cookies.set(`favorited_${itemId}`, !isFavorited, { expires: 365 });
                updateFavoritedState(itemId);

                // Handle visibility changes if on the favorites page
                if (document.body.classList.contains('favorites')) {
                    let collectionItem = this.closest('.collection-item.mix');
                    if (collectionItem) {
                        if (isFavorited) {
                            collectionItem.classList.add('hide');
                            collectionItem.style.display = 'none';

                            // Check if this was the last visible item
                            let visibleItems = document.querySelectorAll('.collection-item.mix:not(.hide)');
                            if (visibleItems.length === 0) {
                                let noFavoritesMessage = document.getElementById('no-favorites-message');
                                if (!noFavoritesMessage) {
                                    noFavoritesMessage = document.createElement('div');
                                    noFavoritesMessage.id = 'no-favorites-message';
                                    noFavoritesMessage.style.textAlign = 'left';
                                    noFavoritesMessage.style.padding = '1rem';
                                    noFavoritesMessage.style.fontSize = '1rem';
                                    noFavoritesMessage.innerHTML = "You haven't favorited any apartments yet. Click the hearts to save your favorites.";

                                    // Insert the message before the first item in the list
                                    let parentContainer = collectionItem.parentNode;
                                    parentContainer.insertBefore(noFavoritesMessage, parentContainer.firstChild);
                                }
                                noFavoritesMessage.style.display = '';
                            }
                        } else {
                            collectionItem.classList.remove('hide');
                            collectionItem.style.display = '';

                            // Hide the "no favorites" message if it exists
                            let noFavoritesMessage = document.getElementById('no-favorites-message');
                            if (noFavoritesMessage) {
                                noFavoritesMessage.style.display = 'none';
                            }
                        }
                    }
                }
            });
        });
    }

    // Handles the favorites page specifically, ensuring that only favorited items are displayed
    function handleFavoritesPage() {
        if (document.body.classList.contains('favorites')) {
            var savedSort = getSavedSortState();
            var items = Array.from(document.querySelectorAll('.collection-item.mix'));
            var visibleItemsCount = 0;

            items.forEach(item => {
                let heartWrapper = item.querySelector('.heart-wrapper');
                if (heartWrapper) {
                    let itemId = heartWrapper.getAttribute('data-id');
                    if (Cookies.get(`favorited_${itemId}`) === "true") {
                        item.classList.remove('hide');
                        item.style.display = '';
                        visibleItemsCount++;
                    } else {
                        item.classList.add('hide');
                        item.style.display = 'none';
                    }
                }
            });

            // Display a message if no items are favorited
            var noFavoritesMessage = document.getElementById('no-favorites-message');
            if (visibleItemsCount === 0) {
                if (!noFavoritesMessage) {
                    noFavoritesMessage = document.createElement('div');
                    noFavoritesMessage.id = 'no-favorites-message';
                    noFavoritesMessage.style.textAlign = 'left';
                    noFavoritesMessage.style.padding = '1rem';
                    noFavoritesMessage.style.fontSize = '1rem';
                    noFavoritesMessage.innerHTML = "You haven't favorited any apartments yet. Click the hearts to save your favorites.";

                    // Insert the message before the first item in the list
                    var parentContainer = items[0].parentNode;
                    parentContainer.insertBefore(noFavoritesMessage, parentContainer.firstChild);
                }
                noFavoritesMessage.style.display = '';
            } else if (noFavoritesMessage) {
                noFavoritesMessage.style.display = 'none';
            }

            if (savedSort.field && savedSort.order) {
                sortFavorites(items, savedSort.field, savedSort.order);
            }
        }
    }

    // Sorts the favorite items based on the provided sort field and order
    function sortFavorites(items, field, order) {
        var parent = items[0].parentNode;
        items.sort((a, b) => {
            var aValue = a.getAttribute(`data-${field}`);
            var bValue = b.getAttribute(`data-${field}`);
            if (field === 'price' || field === 'sqft') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }
            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        items.forEach(item => parent.appendChild(item));
    }

    // Initialization Function

    // Initializes and sets up various event listeners, formatting, sorting, and filter logic
    function init() {
        // Format currency for price elements
        document.querySelectorAll('.price').forEach(function (element) {
            var number = parseFloat(element.textContent);
            if (!isNaN(number)) {
                element.textContent = formatAsCurrencyWithoutCents(number);
            }
        });

        // Format dates for available-date elements
        document.querySelectorAll('.available-date').forEach(function (element) {
            const originalDate = element.textContent.trim();
            if (originalDate) {
                element.textContent = formatDate(originalDate);
            }
        });

        // Handle state if the unit type has changed
        if (hasUnitTypeChanged()) {
            clearSortState();
            localStorage.removeItem('scrollTop');
            localStorage.removeItem('scrollLeft');
            saveUnitType();
        } else {
            restoreScrollPosition();
        }

        adjustLinksForMobile();
        initializeSortAndFilterButtons();
        setupKnockButtons();
        setActiveUnitAsVisited();
        setupUnitLinks();
        setupHeartWrappers();
        handleFavoritesPage();

        // Debugging
        console.log('Unit type:', getUnitType());
        console.log('Scroll direction:', getScrollDirection());
        console.log('Has unit type changed?', hasUnitTypeChanged());
    }

    // Event Listeners

    // Listens for touch events and saves scroll position when interacting with the page
    document.addEventListener('touchstart', saveScrollPosition);

    // Saves scroll position when the window is about to unload
    window.addEventListener('beforeunload', saveScrollPosition);

    // Adjusts links when the window is resized (for responsive adjustments)
    window.addEventListener('resize', adjustLinksForMobile);

    // Initialize all functionality
    init();
});