var sledvopros = 0;
var vopros = [];
var podskaz = [];
var nomvoprosa = [];
var otveti = [];
var prav = [];
var img = [];
var otvetodinn = [];
var img1 = "foto/2.gif";
var img2 = "foto/3.gif";
var lop = 0;
var neprnomvopr = [];
var nepravelotvet = [];
var pravotveti = [];
var lip = 0;
img[0] = new Image();
vopros[0] = "Как называется поперечная балка подпалубного набора, проходящая от борта до борта?";
podskaz[0] = "Бимс";
nomvoprosa[0] = "1";
img[0].src = "/foto/mytestfoto/1.jpg?1455194377";
otvetodinn[0] = "";
otveti[0] = [];
prav[0] = [];
otveti[0][0] = "Бимс";
prav[0][0] = "1";
otveti[0][1] = "Флор";
prav[0][1] = "0";
otveti[0][2] = "Карлингс";
prav[0][2] = "0";
otveti[0][3] = "Стрингер";
prav[0][3] = "0";
img[1] = new Image();
vopros[1] = "Какой из этих якорей является адмиралтейским?";
podskaz[1] = "г";
nomvoprosa[1] = "2";
img[1].src = "/foto/mytestfoto/2.jpg?1455194377";
otvetodinn[1] = "";
otveti[1] = [];
prav[1] = [];
otveti[1][0] = "а";
prav[1][0] = "0";
otveti[1][1] = "б";
prav[1][1] = "0";
otveti[1][2] = "в";
prav[1][2] = "0";
otveti[1][3] = "г";
prav[1][3] = "1";
img[2] = new Image();
vopros[2] = "Как называется угломерный инструмент, предназначенный для измерения высот небесных светил и углов (вертикальных и горизонтальных) на земной поверхности?";
podskaz[2] = "Секстан";
nomvoprosa[2] = "3";
img[2].src = "/foto/mytestfoto/3.jpg?1455194377";
otvetodinn[2] = "";
otveti[2] = [];
prav[2] = [];
otveti[2][0] = "Транспортир";
prav[2][0] = "0";
otveti[2][1] = "Пеленгатор";
prav[2][1] = "0";
otveti[2][2] = "Хронометр";
prav[2][2] = "0";
otveti[2][3] = "Секстан";
prav[2][3] = "1";
img[3] = new Image();
vopros[3] = "Как называется угол между плоскостью экватора и радиусом, проведенным из центра Земли в заданную точку на земной поверхности?";
podskaz[3] = "Широта";
nomvoprosa[3] = "4";
img[3].src = "/foto/mytestfoto/4.jpg?1455194377";
otvetodinn[3] = "";
otveti[3] = [];
prav[3] = [];
otveti[3][0] = "Широта";
prav[3][0] = "1";
otveti[3][1] = "Долгота";
prav[3][1] = "0";
otveti[3][2] = "Курсовой угол";
prav[3][2] = "0";
otveti[3][3] = "Магнитное склонение";
prav[3][3] = "0";
img[4] = new Image();
vopros[4] = "При каком действии судоводителя на буксировщике (слева), в случае необходимости оборота, диаметр циркуляции будет минимальным?";
podskaz[4] = "При перекладке руля на правый борт";
nomvoprosa[4] = "5";
img[4].src = "/foto/mytestfoto/5.jpg?1455194377";
otvetodinn[4] = "";
otveti[4] = [];
prav[4] = [];
otveti[4][0] = "При перекладке руля на левый борт";
prav[4][0] = "0";
otveti[4][1] = "При перекладке руля на правый борт";
prav[4][1] = "1";
otveti[4][2] = "При перекладке руля на левый борт с учеличением скорости";
prav[4][2] = "0";
otveti[4][3] = "Диаметр циркуляции не зависит от стороны перекладки руля";
prav[4][3] = "0";
img[5] = new Image();
vopros[5] = "Что это за навигационный знак?";
podskaz[5] = "Ограждающий отдельную опасность";
nomvoprosa[5] = "6";
img[5].src = "/foto/mytestfoto/6.jpg?1455194377";
otvetodinn[5] = "";
otveti[5] = [];
prav[5] = [];
otveti[5][0] = "Осевой";
prav[5][0] = "0";
otveti[5][1] = "Чистой воды";
prav[5][1] = "0";
otveti[5][2] = "Ограждающий отдельную опасность";
prav[5][2] = "1";
otveti[5][3] = "Специального назначения";
prav[5][3] = "0";
img[6] = new Image();
vopros[6] = "Решите задачу:";
podskaz[6] = "200°";
nomvoprosa[6] = "7";
img[6].src = "/foto/mytestfoto/7.jpg?1455194377";
otvetodinn[6] = "";
otveti[6] = [];
prav[6] = [];
otveti[6][0] = "280°";
prav[6][0] = "0";
otveti[6][1] = "100°";
prav[6][1] = "0";
otveti[6][2] = "20°";
prav[6][2] = "0";
otveti[6][3] = "200°";
prav[6][3] = "1";
img[7] = new Image();
vopros[7] = "Что это за сигнал по Международному своду сигналов?";
podskaz[7] = "Сигнал бедствия";
nomvoprosa[7] = "8";
img[7].src = "/foto/mytestfoto/8.jpg?1455194377";
otvetodinn[7] = "";
otveti[7] = [];
prav[7] = [];
otveti[7][0] = "Остановите свое судно";
prav[7][0] = "0";
otveti[7][1] = "Человек за бортом";
prav[7][1] = "0";
otveti[7][2] = "Сигнал бедствия";
prav[7][2] = "1";
otveti[7][3] = "Я делаю поворот вправо";
prav[7][3] = "0";
img[8] = new Image();
vopros[8] = "Какое из этих судов, идущих на вас, занято дноуглубительными работами?";
podskaz[8] = "Такого судна здесь нет";
nomvoprosa[8] = "9";
img[8].src = "/foto/mytestfoto/9.jpg?1455194377";
otvetodinn[8] = "";
otveti[8] = [];
prav[8] = [];
otveti[8][0] = "б";
prav[8][0] = "0";
otveti[8][1] = "а";
prav[8][1] = "0";
otveti[8][2] = "в";
prav[8][2] = "0";
otveti[8][3] = "Такого судна здесь нет";
prav[8][3] = "1";
img[9] = new Image();
vopros[9] = "При каких неисправностях запрещается пользование маломерным судном?";
podskaz[9] = "Во всех перечисленных выше случаях";
nomvoprosa[9] = "10";
img[9].src = "/foto/mytestfoto/10.jpg?1455194377";
otvetodinn[9] = "";
otveti[9] = [];
prav[9] = [];
otveti[9][0] = "При наличии сквозных пробоин корпуса судна";
prav[9][0] = "0";
otveti[9][1] = "При разгерметизации гермоотсеков";
prav[9][1] = "0";
otveti[9][2] = "При повреждении системы дистанционного управления двигателем";
prav[9][2] = "0";
otveti[9][3] = "Во всех перечисленных выше случаях";
prav[9][3] = "1";