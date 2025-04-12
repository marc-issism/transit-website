
class RoutePrediction {

    constructor(title, time_predictions) {
        this.title = title;
        this.time_predictions = time_predictions;
    }
}

console.log("transit");


const STOP_URL = "https://retro.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&stopId=";

function get_stop_prediction() {

    // grab value
    let stop_id = document.getElementById("stopPredictionInput").value.trim();

    // clear value
    document.getElementById("stopPredictionDisplay").innerHTML = "";

    fetch(STOP_URL + stop_id)
        .then(response => {
            if (response.ok) {
                response = response.json();
                return response;
            }
            else {
                throw new Error('NextBus API request failed to call stop ID.');
            }
        })
        .then(data => {
            
            if (!JSON.stringify(data).includes("predictions")) {
                document.getElementById("stopPredictionDisplay").innerHTML = "<br/>Invalid Stop Number"
                return;
            }

            let predictions = data.predictions;
            let route_predictions = new Array;

            if (predictions instanceof Array) {
                for (const pred of predictions) {
                    if (JSON.stringify(pred).includes("dirTitleBecauseNoPredictions")) {
                        route_predictions = route_predictions.concat(new RoutePrediction(pred.dirTitleBecauseNoPredictions, []));
                    }
                    else {
                        route_predictions = route_predictions.concat(process_direction(pred.direction));
                    }
                }
            }
            else {
                route_predictions = route_predictions.concat(process_direction(predictions.direction));
            }

            /* DEBUGGING 
            for (route of route_predictions) {
                console.log(route.title);
                for (time of route.time_predictions) {
                    console.log(time + " minutes");
                }
            }
            */
            
            document.getElementById("stopPredictionInput").value = "";
            display_stop_predictions(route_predictions);

        }) 

}

function display_stop_predictions(route_predictions) {

    document.getElementById("stopPredictionDisplay").appendChild(document.createElement("br"));

    for (direction of route_predictions) {
        const dir_header_element = document.createElement("dirHeader");
        dir_header_element.innerHTML = direction.title;
        document.getElementById("stopPredictionDisplay").appendChild(dir_header_element);
        document.getElementById("stopPredictionDisplay").appendChild(document.createElement("br"));

        for (time of direction.time_predictions) {
            const dir_time_element = document.createElement("dirTime");
            if (time == 0) {
                dir_time_element.innerHTML = "DUE";
            }
            else {
                dir_time_element.innerHTML = time + " minutes";
            }
            document.getElementById("stopPredictionDisplay").appendChild(dir_time_element);
            document.getElementById("stopPredictionDisplay").appendChild(document.createElement("br"));
        }
        document.getElementById("stopPredictionDisplay").appendChild(document.createElement("br"));
    }
    const element = document.createElement("p");
                document.getElementById("display").appendChild(element);

}

function process_direction(direction) {

    let route_predictions = new Array;

    if (direction instanceof Array) {
        for (const dir of direction) {
            let time_predictions = process_prediction(dir.prediction);
            route_predictions.push(new RoutePrediction(dir.title, time_predictions));
        }
    }
    else {
        let time_predictions = process_prediction(direction.prediction);
        route_predictions.push(new RoutePrediction(direction.title, time_predictions));
    }

    return route_predictions;
}

function process_prediction(prediction) {

    let time_predictions = new Array;

    if (prediction instanceof Array) {
        for (const time_prediction of prediction) {
            time_predictions.push(time_prediction.minutes);
        }
    }
    else {
        time_predictions.push(prediction.minutes);
    }

    return time_predictions;

}

function get_predictions() {
    let stop_id = document.getElementById("routeInput").value;
    console.log(stop_id)

    document.getElementById("display").innerHTML = "";

    fetch(STOP_URL + stop_id)
        .then(response => {
            if (response.ok) {
                response = response.json();
                return response;
            }
            else {
                throw new Error('NextBus API request failed.')
            }
        })
        .then(data => {
            console.log(data);
        

            if (data.predictions.length == 1) {
                let parse = data.predictions;
                const element = document.createElement("p");
                element.textContent = parse.routeTag;
                console.log(parse.routeTag);
                document.getElementById("display").appendChild(element);
            }
            else {
                for (let i = 0; i < data.predictions.length; i++) {
                    let parse = data.predictions[i];
                    const element = document.createElement("p");
                    element.textContent = parse.routeTag;
                    console.log(parse.routeTag);
                    document.getElementById("display").appendChild(element);
                }
            }

        })

}






