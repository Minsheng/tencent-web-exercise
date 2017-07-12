/* enter search text and autocomplete search field */
/* Optional: keep track of frequency of hit of each word and recommend the most popular */
var masterData = ["abort", "aeroplane"];
var searchFieldId = "searchResult";

/* need to listen to user input event and autofill */
/* onchange event take user input txt */
function searchQuery() {
    var val = document.getElementById(searchFieldId).value;

    if (val !== "") {
        var candidates = [];

        // look up data in master data array
        masterData.forEach(function(d) {
            // check if partially match with current word
            // in case it is case-sensitive
            val = val.toLowerCase();

            if (d.indexOf(val) !== -1) {
                // found autofill input field
                // add to candidate list
                // document.getElementById(searchFieldId).value = d;
                candidates.push(d);
            }
        });

        // show recommendation dropdown
        renderCandidates();
    }
}
