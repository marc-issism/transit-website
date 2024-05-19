
const STOP_URL = "https://retro.umoiq.com/service/publicXMLFeed?command=predictions&a=ttc&stopId=";



function get_predictions() {
    let stop_id = 15116;

    fetch(STOP_URL + stop_id)
    .then(response => response.text())
    .then(data => {
        //console.log(data)
        let parser = new DOMParser();
        let xml = parser.parseFromString(data, "text/xml");
        document.getElementById('output').textContent = data;
        console.log(xml);
    });

}

get_predictions();




