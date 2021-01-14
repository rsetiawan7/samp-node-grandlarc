import {
  AddPlayerClass,
  DisableInteriorEnterExits,
  EnableStuntBonusForAll,
  GetTickCount,
  KEY,
  OnGameModeInit,
  OnPlayerConnect,
  OnPlayerDeath,
  OnPlayerRequestClass,
  OnPlayerSpawn,
  OnPlayerUpdate,
  PLAYER_STATE,
  SampPlayer,
  SendClientMessageToAll,
  SetGameModeText,
  SetNameTagDrawDistance,
  SetWeather,
  SetWorldTime,
  ShowNameTags,
  ShowPlayerMarkers,
  TextDrawBackgroundColor,
  TextDrawBoxColor,
  TextDrawColor,
  TextDrawCreate,
  TextDrawFont,
  TextDrawLetterSize,
  TextDrawSetOutline,
  TextDrawSetShadow,
  TextDrawTextSize,
  TextDrawUseBox,
  WEAPON,
} from 'samp-node-lib';

import {
  ARMY_SPAWNS,
  MEDICAL_SPAWNS,
  POLICE_SPAWNS,
  RANDOM_SPAWNS_LS,
  RANDOM_SPAWNS_LV,
  RANDOM_SPAWNS_SF,
} from './spawns';

import {
  LoadStaticVehiclesFromFile
} from './common';

const COLOR_WHITE         = 'rgba(255,255,255,1)';
const COLOR_NORMAL_PLAYER = 'rgba(255,187,255,1)';

const CITY_LOS_SANTOS   = 0;
const CITY_SAN_FIERRO   = 1;
const CITY_LAS_VENTURAS = 2;

let txtClassSelHelper: number;
let txtLosSantos: number;
let txtSanFierro: number;
let txtLasVenturas: number;

/**
 * Functions
 */
const PlayerGetCitySelection = (player: SampPlayer): number => {
  if (!player) {
    return 0;
  }

  if (!player.IsPlayerConnected()) {
    return 0;
  }

  if (!player.state.citySelection) {
    return 0;
  }

  return player.state.citySelection;
}

const PlayerGetCitySelected = (player: SampPlayer): number => {
  if (!player) {
    return 0;
  }

  if (!player.IsPlayerConnected()) {
    return 0;
  }

  if (!player.state.citySelected) {
    return 0;
  }

  return player.state.citySelected;
}

const PlayerGetLastSelectionTick = (player: SampPlayer): number => {
  if (!player) {
    return 0;
  }

  if (!player.IsPlayerConnected()) {
    return 0;
  }

  if (!player.state.lastCitySelectionTick) {
    return 0;
  }

  return player.state.lastCitySelectionTick;
}

const PlayerSetCitySelection = (player: SampPlayer, value: number = -1): number => {
  if (!player) {
    return 0;
  }

  if (!player.IsPlayerConnected()) {
    return 0;
  }

  player.setState({ citySelection: value });
  return 1;
}

const PlayerSetCitySelected = (player: SampPlayer, value: number = 0): number => {
  if (!player) {
    return 0;
  }

  if (!player.IsPlayerConnected()) {
    return 0;
  }

  player.setState({ citySelected: value });
  return 1;
}

const PlayerUpdateLastSelectionTick = (player: SampPlayer): number => {
  if (!player) {
    return 0;
  }

  if (!player.IsPlayerConnected()) {
    return 0;
  }

  player.setState({ lastCitySelectionTick: GetTickCount() });
  return 1;
}

const ClassSelectionSetupCharSelection = (player: SampPlayer) =>
{
  if (PlayerGetCitySelection(player) === CITY_LOS_SANTOS) {
    player.SetPlayerInterior(11);
    player.SetPlayerPos(508.7362,-87.4335,998.9609);
    player.SetPlayerFacingAngle(0.0);
    player.SetPlayerCameraPos(508.7362,-83.4335,998.9609);
    player.SetPlayerCameraLookAt(508.7362,-87.4335,998.9609, 2);
  } else if (PlayerGetCitySelection(player) === CITY_SAN_FIERRO) {
    player.SetPlayerInterior(3);
    player.SetPlayerPos(-2673.8381,1399.7424,918.3516);
    player.SetPlayerFacingAngle(181.0);
    player.SetPlayerCameraPos(-2673.2776,1394.3859,918.3516);
    player.SetPlayerCameraLookAt(-2673.8381,1399.7424,918.3516, 2);
  } else if (PlayerGetCitySelection(player) === CITY_LAS_VENTURAS) {
    player.SetPlayerInterior(3);
    player.SetPlayerPos(349.0453,193.2271,1014.1797);
    player.SetPlayerFacingAngle(286.25);
    player.SetPlayerCameraPos(352.9164,194.5702,1014.1875);
    player.SetPlayerCameraLookAt(349.0453,193.2271,1014.1797, 2);
  }
}

const ClassSelectionInitCityNameText = (txt: number) =>
{
  TextDrawUseBox(txt, 0);
  TextDrawLetterSize(txt, 1.25, 3.0);
  TextDrawFont(txt, 0);
  TextDrawSetShadow(txt, 0);
  TextDrawSetOutline(txt, 1);
  TextDrawColor(txt, 'rgba(238, 238, 238, 1)');
  TextDrawBackgroundColor(txtClassSelHelper, 'rgba(0, 0, 0, 1)');
}

const ClassSelectionInitTextDraws = () =>
{
  // Init our observer helper text display
  txtLosSantos = TextDrawCreate(10.0, 380.0, "Los Santos");
  ClassSelectionInitCityNameText(txtLosSantos);
  txtSanFierro = TextDrawCreate(10.0, 380.0, "San Fierro");
  ClassSelectionInitCityNameText(txtSanFierro);
  txtLasVenturas = TextDrawCreate(10.0, 380.0, "Las Venturas");
  ClassSelectionInitCityNameText(txtLasVenturas);

  // Init our observer helper text display
  txtClassSelHelper = TextDrawCreate(10.0, 415.0, " Press ~b~~k~~GO_LEFT~ ~w~or ~b~~k~~GO_RIGHT~ ~w~to switch cities.~n~ Press ~r~~k~~PED_FIREWEAPON~ ~w~to select.");
  TextDrawUseBox(txtClassSelHelper, 1);
  TextDrawBoxColor(txtClassSelHelper,'rgba(22,22,22,187)');
  TextDrawLetterSize(txtClassSelHelper,0.3,1.0);
  TextDrawTextSize(txtClassSelHelper,400.0,40.0);
  TextDrawFont(txtClassSelHelper, 2);
  TextDrawSetShadow(txtClassSelHelper,0);
  TextDrawSetOutline(txtClassSelHelper,1);
  TextDrawBackgroundColor(txtClassSelHelper,'rgba(0,0,0,1)');
  TextDrawColor(txtClassSelHelper,'rgba(255,255,255,1)');
}

const ClassSelectionSetupSelectedCity = (player: SampPlayer) =>
{
  if (PlayerGetCitySelection(player) === -1) {
    PlayerSetCitySelection(player, CITY_LOS_SANTOS);
  }

  if (PlayerGetCitySelection(player) === CITY_LOS_SANTOS) {
    player.SetPlayerInterior(0);
    player.SetPlayerCameraPos(1630.6136,-2286.0298,110.0);
    player.SetPlayerCameraLookAt(1887.6034,-1682.1442,47.6167, 2);

    player.TextDrawShowForPlayer(txtLosSantos);
    player.TextDrawHideForPlayer(txtSanFierro);
    player.TextDrawHideForPlayer(txtLasVenturas);
  } else if (PlayerGetCitySelection(player) === CITY_SAN_FIERRO) {
    player.SetPlayerInterior(0);
    player.SetPlayerCameraPos(-1300.8754,68.0546,129.4823);
    player.SetPlayerCameraLookAt(-1817.9412,769.3878,132.6589, 2);

    player.TextDrawHideForPlayer(txtLosSantos);
    player.TextDrawShowForPlayer(txtSanFierro);
    player.TextDrawHideForPlayer(txtLasVenturas);
  } else if (PlayerGetCitySelection(player) === CITY_LAS_VENTURAS) {
    player.SetPlayerInterior(0);
    player.SetPlayerCameraPos(1310.6155,1675.9182,110.7390);
    player.SetPlayerCameraLookAt(2285.2944,1919.3756,68.2275, 2);

    player.TextDrawHideForPlayer(txtLosSantos);
    player.TextDrawHideForPlayer(txtSanFierro);
    player.TextDrawShowForPlayer(txtLasVenturas);
  }
}

const ClassSelectionSwitchToNextCity = (player: SampPlayer) =>
{
  PlayerSetCitySelection(player, PlayerGetCitySelection(player) + 1);

  player.SendClientMessage(COLOR_WHITE, `citySelection: ${PlayerGetCitySelection(player)}`);
  if (PlayerGetCitySelection(player) > CITY_LAS_VENTURAS) {
    PlayerSetCitySelection(player, CITY_LOS_SANTOS);
  }

  player.PlayerPlaySound(1052,0.0,0.0,0.0);
  PlayerUpdateLastSelectionTick(player);
	ClassSelectionSetupSelectedCity(player);
}

const ClassSelectionSwitchToPreviousCity = (player: SampPlayer) =>
{
  PlayerSetCitySelection(player, PlayerGetCitySelection(player) - 1);

  player.SendClientMessage(COLOR_WHITE, `citySelection: ${PlayerGetCitySelection(player)}`);
  if (PlayerGetCitySelection(player) < CITY_LOS_SANTOS) {
    PlayerSetCitySelection(player, CITY_LAS_VENTURAS);
  }

	player.PlayerPlaySound(1053,0.0,0.0,0.0);
	PlayerUpdateLastSelectionTick(player);
	ClassSelectionSetupSelectedCity(player);
}

const ClassSelectionHandleCitySelection = (player: SampPlayer) =>
{
  const [
    key,
    ud,
    lr
  ] = player.GetPlayerKeys();

  if (PlayerGetCitySelection(player) === -1) {
    ClassSelectionSwitchToNextCity(player);
    return;
  }

  // only allow new selection every ~500 ms
  const lastSelectionTick = PlayerGetLastSelectionTick(player);
  if ((GetTickCount() - lastSelectionTick) < 500) {
    return;
  }

  // tslint:disable-next-line: no-bitwise
  if (key & KEY.FIRE) {
    PlayerSetCitySelected(player, 1);

    player.TextDrawHideForPlayer(txtClassSelHelper);
    player.TextDrawHideForPlayer(txtLosSantos);
    player.TextDrawHideForPlayer(txtSanFierro);
    player.TextDrawHideForPlayer(txtLasVenturas);
    player.TogglePlayerSpectating(0);
    return;
  }

  if (lr > 0) {
    ClassSelectionSwitchToNextCity(player);
  } else if (lr < 0) {
    ClassSelectionSwitchToPreviousCity(player);
  }
}

/**
 * Events
 */
OnGameModeInit(() => {
  SetGameModeText('Grand Larceny');
  ShowPlayerMarkers(1);
  ShowNameTags(1);
  SetNameTagDrawDistance(40);
  EnableStuntBonusForAll(0);
  DisableInteriorEnterExits();
  SetWeather(2);
  SetWorldTime(11);

  AddPlayerClass(298,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(299,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(300,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(301,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(302,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(303,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(304,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(305,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(280,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(281,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(282,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(283,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(284,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(285,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(286,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(287,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(288,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(289,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(265,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(266,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(267,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(268,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(269,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(270,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(1,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(2,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(3,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(4,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(5,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(6,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(8,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(42,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(65,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(86,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(119,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(149,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(208,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(273,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(289,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);

  AddPlayerClass(47,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(48,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(49,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(50,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(51,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(52,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(53,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(54,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(55,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(56,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(57,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(58,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(68,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(69,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(70,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(71,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(72,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(73,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(75,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(76,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(78,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(79,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(80,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(81,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(82,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(83,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(84,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(85,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(87,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(88,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(89,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(91,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(92,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(93,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(95,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(96,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(97,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(98,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);
  AddPlayerClass(99,1759.0189,-1898.1260,13.5622,266.4503,-1,-1,-1,-1,-1,-1);

  // TextDraw
  ClassSelectionInitTextDraws();

  // LoadStaticVehiclesFromFile('trains.txt');
  // LoadStaticVehiclesFromFile('pilots.txt');
  // LoadStaticVehiclesFromFile('lv_law.txt');
  // LoadStaticVehiclesFromFile('lv_airport.txt');
  // LoadStaticVehiclesFromFile('lv_gen.txt');
  // LoadStaticVehiclesFromFile('sf_law.txt');
  // LoadStaticVehiclesFromFile('sf_airport.txt');
  // LoadStaticVehiclesFromFile('sf_gen.txt');
  // LoadStaticVehiclesFromFile('ls_law.txt');
  // LoadStaticVehiclesFromFile('ls_airport.txt');
  // LoadStaticVehiclesFromFile('ls_gen_inner.txt');
  // LoadStaticVehiclesFromFile('ls_gen_outer.txt');
  // LoadStaticVehiclesFromFile('whetstone.txt');
  // LoadStaticVehiclesFromFile('bone.txt');
  // LoadStaticVehiclesFromFile('flint.txt');
  // LoadStaticVehiclesFromFile('tierra.txt');
  // LoadStaticVehiclesFromFile('red_county.txt');
});

OnPlayerConnect(player => {
  player.GameTextForPlayer('~w~Grand Larceny', 3000, 4);
  player.SendClientMessage(COLOR_WHITE, 'Welcome to {88AA88}G{FFFFFF}rand {88AA88}L{FFFFFF}arceny');

  // Class Selection init vars.
  player.setState({
    citySelection: -1,
    citySelected: 0,
    lastCitySelectionTick: GetTickCount(),
  });

  return 1;
});

OnPlayerRequestClass((player: SampPlayer, _: number) => {
  if (player.IsPlayerNPC()) {
    return 1;
  }

  if (PlayerGetCitySelected(player)) {
    ClassSelectionSetupCharSelection(player);
    return 1;
  }

  if (player.GetPlayerState() !== PLAYER_STATE.SPECTATING) {
    player.TogglePlayerSpectating(1);
    player.TextDrawShowForPlayer(txtClassSelHelper);
    PlayerSetCitySelection(player, -1);
  }

  return 0;
})

OnPlayerSpawn(player => {
  if (player.IsPlayerNPC()) {
    return 1;
  }

  let randomSpawn = 0;

  player.SetPlayerInterior(0);
  player.TogglePlayerClock(0);
  player.ResetPlayerMoney();
  player.GivePlayerMoney(30000);

  SendClientMessageToAll(COLOR_WHITE, `citySelection: ${PlayerGetCitySelection(player)}`);
  if (PlayerGetCitySelection(player) === CITY_LOS_SANTOS) {
    randomSpawn = RANDOM_SPAWNS_LS.length;
    const randomPos = RANDOM_SPAWNS_LS[randomSpawn];

    player.SetPlayerPos(randomPos[0], randomPos[1], randomPos[2]);
    player.SetPlayerFacingAngle(randomPos[3]);
  } else if (PlayerGetCitySelection(player) === CITY_SAN_FIERRO) {
    randomSpawn = RANDOM_SPAWNS_SF.length;
    const randomPos = RANDOM_SPAWNS_SF[randomSpawn];

    player.SetPlayerPos(randomPos[0], randomPos[1], randomPos[2]);
    player.SetPlayerFacingAngle(randomPos[3]);
  } else if (PlayerGetCitySelection(player) === CITY_LAS_VENTURAS) {
    randomSpawn = RANDOM_SPAWNS_LV.length;
    const randomPos = RANDOM_SPAWNS_LV[randomSpawn];

    player.SetPlayerPos(randomPos[0], randomPos[1], randomPos[2]);
    player.SetPlayerFacingAngle(randomPos[3]);
  }

  player.GivePlayerWeapon(WEAPON.COLT45, 5000);
  player.GivePlayerWeapon(WEAPON.MP5, 5000);
  player.GivePlayerWeapon(WEAPON.M4, 5000);
  player.GivePlayerWeapon(WEAPON.SNIPER, 5000);

  return 1;
});

OnPlayerDeath((player, killer, reason) => {
  let playerCash = 0;

  PlayerSetCitySelected(player, 0);

  if (killer.playerid === 65535) {
    player.ResetPlayerMoney();
    return 1;
  }

  playerCash = player.GetPlayerMoney();

  if (playerCash > 0) {
    killer.GivePlayerMoney(playerCash);
    player.ResetPlayerMoney();
  }
  return 1;
});

OnPlayerUpdate(player => {
  if (!player.IsPlayerConnected()) {
    return 0;
  }

  if (player.IsPlayerNPC()) {
    return 1;
  }

  if (!PlayerGetCitySelected(player) && player.GetPlayerState() === PLAYER_STATE.SPECTATING) {
    ClassSelectionHandleCitySelection(player);
    return 1;
  }

  if (player.GetPlayerWeapon() === WEAPON.MINIGUN) {
    player.Kick();
    return 0;
  }

  return 1;
});