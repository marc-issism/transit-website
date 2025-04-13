
function isStandardRoute(route) {
  // trim routes within the range of 1-199, 500-599
  if ((parseInt(route) < 200) || (parseInt(route) < 600 && parseInt(route) > 499)) return true;

  return false;
}

const getRandomHexColor = () => {
  // Define an array of hexadecimal digits
  const hexChars = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];
  // Generate an array of six random indices from 0 to 15
  const hexIndices = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16)
  );
  // Map each index to its corresponding hex digit and join them into a string
  const hexCode = hexIndices.map((i) => hexChars[i]).join('');
  // Return the string with a "#" prefix
  return `#${hexCode}`;
};

(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
  ({key: "AIzaSyCvOsmV0iJ8JVO1kxNyQxxbLk84KrDtKAo", v: "weekly"});

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  let map = new Map(document.getElementById("map"), {
    center: { lat: 43.671070, lng: -79.347015 },
    zoom:12,
  });
}

async function getPathForRoute(route) {
  route = String(route);
  let path = [];

  await fetch("data/routeInfo.json").then(res=>res.json()).then(json=>{

    let direction = json["routeInfo"][route]["direction"][0]["stop"];
    let stops = json["routeInfo"][route]["stop"];
    for (let i = 0; i < direction.length; i++) {
      let stopTag = direction[i]["tag"];
      for (let j = 0; j < stops.length; j++) {
        if (stops[j]["tag"] == stopTag) {
          path.push({lat: parseFloat(stops[j]["lat"]), lng: parseFloat(stops[j]["lon"])})
        }
      }
    }
  });

  return path;
}

function getWholeRoute(route) {
  fetch("data/routeInfo.json").then(res=>res.json()).then(json=>{
    let direction = json["routeInfo"][route]["direction"][0];
    let directionOptions = json["routeInfo"][route]["direction"];
    let max = 0;
    for (let j = 0; j < directionOptions.length; j++) {
      if (directionOptions[j].length > max) {
        max = directionOptions[j];
        direction = directionOptions[j];
      }
    }
    return direction
  });
}

// console.log(getPathForRoute(68));

async function updateMap(routes) {

  const { Map } = await google.maps.importLibrary("maps");

  

  
  fetch("data/routeInfo.json").then(res=>res.json()).then(json=>{
   
    let centerLat =43.651070;
    let centerLng =-79.347015;
    let zoomIn = 12;
    if (routes.length==1) {
      centerLat = (Number(json["routeInfo"][routes[0]]["latMax"]) + Number(json["routeInfo"][routes[0]]["latMin"]))/2;
      centerLng = (Number(json["routeInfo"][routes[0]]["lonMin"]) + Number(json["routeInfo"][routes[0]]["lonMax"]))/2;
    }

    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: zoomIn,
      center: { lat: centerLat, lng: centerLng },
      mapTypeId: "terrain",
    });

    let tripPaths = [];
    let randomColors = [];
    randomColors.push("#FF0000");
    for (let route in routes) {
      randomColors.push(getRandomHexColor());
    }

    for (let i = 0; i < routes.length; i++) {
      let tripPath = [];
      let direction = json["routeInfo"][routes[i]]["direction"][0]["stop"];
      let directionOptions = json["routeInfo"][routes[i]]["direction"];
      let max = 0;
      for (let j = 0; j < directionOptions.length; j++) {
        if (directionOptions[j].length > max) {
          max = directionOptions[j];
          direction = directionOptions[j]["stop"];
        }
      }

      let stops = json["routeInfo"][routes[i]]["stop"];
      for (let j = 0; j < direction.length; j++) {
        let stopTag = direction[j]["tag"];
        for (let k = 0; k < stops.length; k++) {
          if (stops[k]["tag"] == stopTag) {
            tripPath.push({lat: parseFloat(stops[k]["lat"]), lng: parseFloat(stops[k]["lon"])})
          }
        }
      }
      tripPaths.push(tripPath);
    }

    console.log(tripPaths);

    for (let i = 0; i < tripPaths.length; i++) {
      let polylines = new google.maps.Polyline({
        path: tripPaths[i],
        geodesic: true,
        strokeColor: randomColors[i],
        strokeOpacity: 1.0,
        strokeWeight: 4,
        })
      polylines.setMap(map);
    }
  });


}


async function getRandomRoutes() {

  n = document.getElementById("routeCountInput").value;
  startRoute = document.getElementById("startRouteInput").value;
  if (n > 50) {
    document.getElementById("challengeResults").innerHTML = "Please pick between a range of 1 to 50 random routes.";
    return;
  }

  // Pick starting route then extrapolate from there
  let routes = [];
  routes.push(String(startRoute)); n--;
  
  fetch("data/connectingRoutes.json")
    .then(res => res.json())
    .then(json => {
      let tRouteConnections = json[String(startRoute)];
      let masterRoute = String(startRoute);
      let nFound = 0;

      while(nFound < n) {
        let randomIndex = Math.floor(Math.random() * tRouteConnections.length); // get random index based on length of array
        let tRoute = tRouteConnections[randomIndex];
        // console.log("current tRouteConnections = " + masterRoute);
        if (!routes.includes(tRoute) && isStandardRoute(tRoute)) {
          routes.push(tRoute);
          tRouteConnections = json[tRoute]; 
          masterRoute = tRoute;
          nFound++;
        }
        else {
          // console.log(tRoute)
          tRouteConnections.pop(tRoute);
        }
        
      }
    });
    // console.log(routes);
  
  fetch("data/routeInfo.json")
    .then(res => res.json())
    .then(json => {
      document.getElementById("challengeResults").innerHTML = "";
      for (let route of routes) {
        const routeElement = document.createElement("route");
        try {
          routeElement.innerHTML = json.routeInfo[route].title;

        }
        catch {
          document.getElementById("challengeResults").innerHTML = "Please pick a valid starting route.";
          return;
        }
        document.getElementById("challengeResults").appendChild(routeElement);
      }
    });

    updateMap(routes);
}

function getRouteInfo() {
  let route = String(document.getElementById("routeInfoInput").value);
  updateMap([route]);

  fetch("data/routeInfo.json").then(res => res.json()).then(json=>{
    document.getElementById("routeInfoDisplay").innerHTML = "";
    stops = [];
    const routeTitle = document.createElement("routeTitle");
    routeTitle.innerHTML = json["routeInfo"][route]["title"];
    document.getElementById("routeInfoDisplay").appendChild(routeTitle);
    for (let i=0; i < Math.floor(json["routeInfo"][route]["stop"].length/2); i++) {
      const stopTitle = document.createElement("stopTitle");
      stopTitle.innerHTML = json["routeInfo"][route]["stop"][i]["title"] + " | " + (json["routeInfo"][route]["stop"][i]["stopId"] || "");
      document.getElementById("routeInfoDisplay").appendChild(stopTitle);
    }
  });

}

initMap();
