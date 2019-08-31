let net;
const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');

async function predict() {
	if (classifier.getNumClasses() > 0) {
		// Get the activation from mobilenet from the webcam.
		const activation = net.infer(webcamElement, 'conv_preds');
		console.log("Predicting with activation "+activation);
		// Get the most likely class and confidences from the classifier module.
		const result = await classifier.predictClass(activation);
		console.log(result);
  
		const classes = ['A', 'B', 'C'];
		let new_text = "";
		for (var i=0;i<classifier.getNumClasses();i++){
			new_text = new_text + `\n
				prediction: ${classes[i]}\n
				probability: ${result.confidences[i]}
			`;
		}
		document.getElementById('console').innerText = new_text;
	}

	await tf.nextFrame();
}

async function app() {
	console.log('Loading mobilenet..');
  
	// Load the model.
	net = await mobilenet.load();
	console.log('Sucessfully loaded model');
  
	await setupWebcam();
  
	// Reads an image from the webcam and associates it with a specific class
	// index.
	const addExample = classId => {
	  // Get the intermediate activation of MobileNet 'conv_preds' and pass that
	  // to the KNN classifier.
	  const activation = net.infer(webcamElement, 'conv_preds');
  
	  // Pass the intermediate activation to the classifier.
	  classifier.addExample(activation, classId);
	  console.log("Example added "+classId+ " "+activation);
	};
  
	// When clicking a button, add an example for that class.
	document.getElementById('class-a').addEventListener('click', () => addExample(0));
	document.getElementById('class-b').addEventListener('click', () => addExample(1));
	document.getElementById('class-c').addEventListener('click', () => addExample(2));
	document.getElementById('predict').addEventListener('click', () => predict());
	
  }

async function setupWebcam() {
	return new Promise((resolve, reject) => {
	  const navigatorAny = navigator;
	  navigator.getUserMedia = navigator.getUserMedia ||
		  navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
		  navigatorAny.msGetUserMedia;
	  if (navigator.getUserMedia) {
		navigator.getUserMedia({video: true},
		  stream => {
			webcamElement.srcObject = stream;
			webcamElement.addEventListener('loadeddata',  () => resolve(), false);
		  },
		  error => reject());
	  } else {
		reject();
	  }
	});
  }

app();
