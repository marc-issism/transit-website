
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
    zoom: 9,
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

// console.log(getPathForRoute(68));

async function updateMap(routes) {

  const { Map } = await google.maps.importLibrary("maps");

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center: { lat: 43.651070, lng: -79.347015 },
    mapTypeId: "terrain",
  });

  
  fetch("data/routeInfo.json").then(res=>res.json()).then(json=>{
   
    let tripPaths = [];

    for (let i = 0; i < routes.length; i++) {
      let tripPath = [];
      let direction = json["routeInfo"][routes[i]]["direction"][0]["stop"];
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
        strokeColor: getRandomHexColor(),
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
  if (n > 20) {
    document.getElementById("challengeResults").innerHTML = "Please pick between a range of 1 to 20 random routes.";
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
      for (route of routes) {
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

initMap();
