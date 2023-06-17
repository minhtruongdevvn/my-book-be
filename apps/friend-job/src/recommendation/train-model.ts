import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

interface Data {
  isUserSubProvinceSame: number;
  ageDifference: number;
  isUserProvinceSame: number;
  mutualFriend: number;
  commonInterest: number;
  target: number;
}

export const trainModel = async () => {
  const data = await parseCSV('data.csv');

  const xs = tf.tensor2d(
    data.map((d) => [
      d.isUserSubProvinceSame,
      d.ageDifference,
      d.isUserProvinceSame,
      d.mutualFriend,
      d.commonInterest,
    ]),
  );
  const ys = tf.tensor2d(data.map((d) => [d.target]));

  // Define the model architecture
  const model: tf.Sequential = tf.sequential();
  model.add(
    tf.layers.dense({ inputShape: [5], units: 1, activation: 'sigmoid' }),
  );

  //   const model = (await tf.loadLayersModel(
  //     'file://my-model/model.json',
  //   )) as tf.Sequential;

  // Compile the model with an optimizer and loss function
  model.compile({ optimizer: 'sgd', loss: 'binaryCrossentropy' });

  // Train the model
  await model.fit(xs, ys);

  // Make a prediction
  const prediction = model.predict(tf.tensor2d([[1, 5, 1, 18, 3]]));
  console.log(prediction);
};

const parseCSV = async (file: string): Promise<Data[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data as Data[]),
      error: (error) => reject(error),
    });
  });
};
