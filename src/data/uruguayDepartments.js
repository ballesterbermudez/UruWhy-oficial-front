export const uruguayDepartments = [
  { id: 'artigas', name: 'Artigas', points: '190,40 230,30 275,36 286,62 278,92 246,110 206,107 180,84', labelX: 236, labelY: 72 },
  { id: 'rivera', name: 'Rivera', points: '275,36 312,38 350,52 359,86 343,122 308,128 278,92 286,62', labelX: 321, labelY: 80 },
  { id: 'cerro-largo', name: 'Cerro Largo', points: '350,52 386,70 398,108 388,146 359,168 329,158 343,122 359,86', labelX: 366, labelY: 110 },
  { id: 'salto', name: 'Salto', points: '165,110 206,107 214,150 206,198 186,234 157,238 132,214 133,168 148,132', labelX: 175, labelY: 177 },
  { id: 'tacuarembo', name: 'Tacuarembo', points: '214,150 246,110 278,92 308,128 306,184 276,217 234,220 206,198', labelX: 255, labelY: 168 },
  { id: 'treinta-y-tres', name: 'Treinta y Tres', points: '306,184 329,158 359,168 388,146 398,186 391,230 364,256 327,250 306,224', labelX: 352, labelY: 205 },
  { id: 'paysandu', name: 'Paysandu', points: '157,238 186,234 202,276 198,322 174,353 143,352 122,319 128,271', labelX: 167, labelY: 294 },
  { id: 'rio-negro', name: 'Rio Negro', points: '202,276 234,220 276,217 284,262 270,306 230,324 198,322', labelX: 241, labelY: 272 },
  { id: 'durazno', name: 'Durazno', points: '230,324 270,306 309,306 321,344 302,379 263,390 232,370', labelX: 273, labelY: 346 },
  { id: 'flores', name: 'Flores', points: '202,368 232,370 263,390 253,420 222,437 195,420', labelX: 227, labelY: 403 },
  { id: 'soriano', name: 'Soriano', points: '174,353 198,322 230,324 232,370 202,368 186,392 162,393 143,352', labelX: 190, labelY: 356 },
  { id: 'colonia', name: 'Colonia', points: '162,393 186,392 195,420 192,452 162,476 134,474 114,450 118,421 136,400', labelX: 156, labelY: 438 },
  { id: 'florida', name: 'Florida', points: '263,390 302,379 324,405 318,441 289,458 253,420', labelX: 291, labelY: 417 },
  { id: 'lavalleja', name: 'Lavalleja', points: '302,379 321,344 356,332 380,350 383,386 358,414 324,405', labelX: 345, labelY: 368 },
  { id: 'rocha', name: 'Rocha', points: '380,350 403,322 423,336 442,378 434,429 408,460 371,453 358,414 383,386', labelX: 406, labelY: 391 },
  { id: 'maldonado', name: 'Maldonado', points: '358,414 371,453 358,492 329,506 301,484 318,441', labelX: 339, labelY: 461 },
  { id: 'san-jose', name: 'San Jose', points: '192,452 222,437 253,420 289,458 276,492 244,510 210,505 188,478', labelX: 240, labelY: 472 },
  { id: 'canelones', name: 'Canelones', points: '276,492 301,484 329,506 332,529 318,549 283,562 250,552 244,510', labelX: 289, labelY: 528 },
  { id: 'montevideo', name: 'Montevideo', points: '223,548 250,552 248,573 220,585 202,571 205,553', labelX: 229, labelY: 567 }
];

export const departmentNameById = Object.fromEntries(
  uruguayDepartments.map((department) => [department.id, department.name])
);
