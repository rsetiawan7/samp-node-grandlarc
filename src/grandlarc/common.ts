import * as fs from 'fs';
import * as readline from 'readline';
import { AddStaticVehicleEx } from 'samp-node-lib';

export const LoadStaticVehiclesFromFile = (filename: string) => {
  let loadedVehicles = 0;

  const directory = process.cwd() + '/scriptfiles/vehicles/' + filename;

  const fileStream = fs.createReadStream(directory);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  rl.on('line', (line: string) => {
    if (line.length === 0) {
      return;
    }

    const [
      modelid,
      x,
      y,
      z,
      a,
      color1Dirty,
      color2Dirty,
    ] = line.split(',');

    if (Number(modelid) < 400
      || Number(modelid) > 611
      || isNaN(Number(modelid))
      || isNaN(Number(x))
      || isNaN(Number(y))
      || isNaN(Number(z))
      || isNaN(Number(a))
    ) {
      return;
    }


    let color1: number = Number(color1Dirty);
    let color2: number = Number(color2Dirty.split(';')[0]);
    if (isNaN(color2)) {
      // tslint:disable-next-line: no-console
      console.log(`color2: ${color2} -> color2Dirty: ${color2Dirty}`);
    }

    if (isNaN(color1)) {
      color1 = -1;
    }

    if (isNaN(color2)) {
      color2 = -1;
    }

    AddStaticVehicleEx(Number(modelid), Number(x), Number(y), Number(z), Number(a), Number(color1), Number(color2), 1800, 0);

    loadedVehicles++;
  });

  rl.on('close', () => {
    // tslint:disable-next-line: no-console
    console.log(`Loaded ${loadedVehicles} vehicles from: ${filename}`);
  });
}
