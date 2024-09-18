import { kmeans } from "ml-kmeans";
import { h337 } from "./lib/heatmap";

// Interfaces for types
interface Circle {
  x: number;
  y: number;
  id: number;
  clickCount: number;
  element: HTMLDivElement;
  infoElement: HTMLDivElement;
  timeout?: ReturnType<typeof setTimeout>;
}

interface Square {
  x: number;
  y: number;
  element: HTMLDivElement;
}

// State management
let lastClickTime: number = 0;
let circleID: number = 0;
const circlesData: Circle[] = [];
let squares: Square[] = [];
const minDistance = 90;

const board = document.getElementById("board") as HTMLDivElement;
const dataElement = document.getElementById("data") as HTMLDivElement;
const svgCanvas = document.getElementById("lineCanvas") as any;
const heatmapContainer = document.getElementById("heatmap") as HTMLDivElement;

var heatmap = h337().create({
  container: heatmapContainer,
});

// Utility functions
const updateDataElement = (data: Circle[]): void => {
  dataElement.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
};

const getDistance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

// Function to draw a line between two points (direction preview)
const drawLine = (x1: number, y1: number, x2: number, y2: number): void => {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1.toString());
  line.setAttribute("y1", y1.toString());
  line.setAttribute("x2", x2.toString());
  line.setAttribute("y2", y2.toString());
  line.classList.add("line");
  svgCanvas.appendChild(line);

  // Remove the line after 1 second (fades out)
  setTimeout(() => {
    line.style.opacity = "0";
    setTimeout(() => line.remove(), 1000);
  }, 1000);
};

// DOM manipulation functions
const createSquareElement = (x: number, y: number): HTMLDivElement => {
  const square = document.createElement("div");
  square.classList.add("square");
  square.style.left = `${x - 25}px`; // Center the square
  square.style.top = `${y - 25}px`;
  return square;
};

const createCircleElement = (
  x: number,
  y: number,
  id: number,
  timeBetweenClicks: number
): Circle => {
  const circle = document.createElement("div");
  circle.classList.add("circle");
  circle.style.left = `${x - 4}px`;
  circle.style.top = `${y - 4}px`;

  const info = document.createElement("div");
  info.classList.add("info");
  info.style.left = `${x + 10}px`;
  info.style.top = `${y}px`;
  info.textContent = `ID: ${id}, Clicks: 1, Time: ${timeBetweenClicks}ms`;

  board.appendChild(circle);
  board.appendChild(info);

  return { x, y, id, clickCount: 1, element: circle, infoElement: info };
};

// Functional logic for adding/removing circles and squares
const removeCircle = (circle: Circle): void => {
  circle.element.style.opacity = "0";
  circle.infoElement.style.opacity = "0";

  setTimeout(() => {
    circle.element.remove();
    circle.infoElement.remove();
    const index = circlesData.indexOf(circle);
    if (index > -1) {
      circlesData.splice(index, 1);
      updateDataElement(circlesData);
    }
  }, 1000);
};

const createSquare = (x: number, y: number): void => {
  const square = createSquareElement(x, y);
  board.appendChild(square);
  squares.push({ x, y, element: square });

  setTimeout(() => {
    square.style.opacity = "0";
    setTimeout(() => square.remove(), 1000);
  }, 1000);
};

const removeExpiredSquares = (): void => {
  squares = squares.filter((square) => square.element.style.opacity !== "0");
};

// Function to find the closest pair of circles within a cluster and add a square between them
const addSquareBetweenClosestInCluster = (clusterCircles: Circle[]): void => {
  let closestPair: [Circle, Circle] | null = null;

  for (let i = 0; i < clusterCircles.length - 1; i++) {
    for (let j = i + 1; j < clusterCircles.length; j++) {
      const distance = getDistance(
        clusterCircles[i].x,
        clusterCircles[i].y,
        clusterCircles[j].x,
        clusterCircles[j].y
      );
      if (distance < minDistance) {
        closestPair = [clusterCircles[i], clusterCircles[j]];
      }
    }
  }

  if (closestPair) {
    const [circle1, circle2] = closestPair;
    const midX = (circle1.x + circle2.x) / 2;
    const midY = (circle1.y + circle2.y) / 2;
    createSquare(midX, midY);
    drawLine(circle1.x, circle1.y, circle2.x, circle2.y); // Draw direction line between closest circles
  }
};

// KMeans clustering logic for grouping
const handleClustering = (circlesData: Circle[]): void => {
  const coordinates = circlesData.map((circle) => [circle.x, circle.y]);

  if (coordinates.length < 2) return;

  try {
    // Increase the number of clusters dynamically based on the number of circles
    const numClusters = Math.min(circlesData.length, 4); // Cap the number of clusters at 4
    const kmeansResult = kmeans(coordinates, numClusters, {
      distanceFunction(p, q) {
        return Math.sqrt(Math.pow(q[0] - p[0], 2) + Math.pow(q[1] - p[1], 2));
      },
    });

    const clusters = kmeansResult.clusters;

    // For each cluster, find the closest pair of circles and add a square between them
    for (let clusterIndex = 0; clusterIndex < numClusters; clusterIndex++) {
      const clusterCircles = circlesData.filter(
        (circle, index) => clusters[index] === clusterIndex
      );

      if (clusterCircles.length >= 2) {
        addSquareBetweenClosestInCluster(clusterCircles);
      }
    }
  } catch (error) {
    console.error("Error during clustering:", error);
  }
};

// Main logic for handling a click event
const handleClick = (x: number, y: number): void => {
  const currentTime = Date.now();
  const timeBetweenClicks = lastClickTime ? currentTime - lastClickTime : 0;
  lastClickTime = currentTime;

  const existingCircle = circlesData.find(
    (circle) => getDistance(circle.x, circle.y, x, y) < 10
  );

  if (existingCircle) {
    existingCircle.clickCount++;
    existingCircle.infoElement.textContent = `ID: ${existingCircle.id}, Clicks: ${existingCircle.clickCount}, Time: ${timeBetweenClicks}ms`;
    clearTimeout(existingCircle.timeout);
  } else {
    circleID++;
    const newCircle = createCircleElement(x, y, circleID, timeBetweenClicks);
    circlesData.push(newCircle);
    updateDataElement(circlesData);
  }

  const circleToRemove = existingCircle || circlesData[circlesData.length - 1];
  circleToRemove.timeout = setTimeout(() => removeCircle(circleToRemove), 1000);

  // remove heatmap data after 1 second, to avoid heatmap data accumulation
  setTimeout(() => {
    heatmap.removeData({ x, y });
  }, 1000);

  removeExpiredSquares();

  // if (circlesData.length === 1) {
  //   // createSquare(x, y);
  // }

  // if (circlesData.length > 1) {
  //   addSquareBetweenClosestInCluster(circlesData);
  // }

  // handleClustering(circlesData);

  heatmap.addData({ x, y, value: 1 });
};

// Event listener
board.addEventListener("click", (event: MouseEvent) => {
  const { clientX: x, clientY: y } = event;
  console.log(`Click coordinates: X: ${x}, Y: ${y}`);
  handleClick(x, y);
});
