import { Chapter, Difficulty, Question, QuestionType } from '../lib/types';

// Helper to generate a huge mock pool based on rules to guarantee we don't run out.
function generateMockQuestions(): Question[] {
  const allQuestions: Question[] = [];
  let idCounter = 1;

  // Question templates
  const getNbQ = (name: string, i: number) => {
    const tpls = [
      `Tên gọi thay thế của ${name} là gì?`,
      `Công thức ${name} có tên gọi là gì?`,
      `Danh pháp chuẩn của hợp chất ${name} là phần nào?`,
      `Chất có công thức phân tử / cấu tạo ${name} được gọi là:`
    ];
    return tpls[i % tpls.length];
  };

  const getThQ1 = (name: string, i: number) => {
    const tpls = [
      `Phản ứng hóa học đặc trưng của ${name} là loại phản ứng nào?`,
      `Hợp chất ${name} thường tham gia phản ứng nào nhất?`,
      `Loại phản ứng phổ biến nhất cấu thành tính chất của ${name} là?`
    ];
    return tpls[i % tpls.length];
  };

  const getVdQ1 = (name: string, i: number) => {
    const tpls = [
      `Đốt cháy hoàn toàn 1 mol ${name} cần lượng O2 (mol) là khoảng bao nhiêu? (Dựa trên cân bằng nhanh)`,
      `Phản ứng cháy của ${name} tỏa ra nhiều hay ít nhiệt lượng phân tích theo mol O2, hệ số O2 xấp xỉ là?`,
      `Hệ số xấp xỉ của O2 khi lập phương trình đốt cháy ${name} là bao nhiêu?`
    ];
    return tpls[i % tpls.length];
  };

  const hydroCombos = [
    { name: 'CH4', ans: 'Methane', wrong: ['Ethane', 'Propane', 'Butane'], rxn: 'Thế', o2: '2' },
    { name: 'C2H6', ans: 'Ethane', wrong: ['Methane', 'Propane', 'Butane'], rxn: 'Thế', o2: '3.5' },
    { name: 'C3H8', ans: 'Propane', wrong: ['Ethane', 'Methane', 'Butane'], rxn: 'Thế', o2: '5' },
    { name: 'C4H10', ans: 'Butane', wrong: ['Pentane', 'Propane', 'Hexane'], rxn: 'Thế', o2: '6.5' },
    { name: 'C5H12', ans: 'Pentane', wrong: ['Butane', 'Hexane', 'Heptane'], rxn: 'Thế', o2: '8' },
    { name: 'C2H4', ans: 'Ethylene', wrong: ['Ethyne', 'Propylene', 'Methane'], rxn: 'Cộng', o2: '3' },
    { name: 'C3H6', ans: 'Propylene', wrong: ['Ethylene', 'Butylene', 'Propane'], rxn: 'Cộng', o2: '4.5' },
    { name: 'C4H8', ans: 'Butylene', wrong: ['Propylene', 'Pentylene', 'Butane'], rxn: 'Cộng', o2: '6' },
    { name: 'C2H2', ans: 'Acetylene', wrong: ['Ethylene', 'Propyne', 'Benzene'], rxn: 'Cộng', o2: '2.5' },
    { name: 'C3H4', ans: 'Propyne', wrong: ['Acetylene', 'Butyne', 'Propene'], rxn: 'Cộng', o2: '4' },
    { name: 'C6H6', ans: 'Benzene', wrong: ['Toluene', 'Hexane', 'Cyclohexane'], rxn: 'Thế', o2: '7.5' },
    { name: 'C7H8', ans: 'Toluene', wrong: ['Benzene', 'Xylene', 'Phenol'], rxn: 'Thế', o2: '9' },
  ];

  // Generate 80 unique questions for chapter 4
  for (let i = 0; i < 80; i++) {
    const isLab = i < 20; // 25% lab
    const combo = hydroCombos[i % hydroCombos.length];
    
    let diff: Difficulty = 'nhan_biet';
    if (i % 10 >= 4 && i % 10 < 7) diff = 'thong_hieu';
    if (i % 10 >= 7) diff = 'van_dung';

    if (isLab) {
      allQuestions.push({
        id: `q4_lab_${idCounter++}`,
        chapter: 'chuong_4',
        type: 'thi_nghiem',
        difficulty: diff,
        question: `Hiện tượng xảy ra khi cho ${combo.name} vào ống nghiệm chứa nước Br2 là gì? (Phần ${idCounter})`,
        options: ['Mất màu dung dịch', 'Xuất hiện kết tủa trắng', 'Có khí thoát ra', 'Không hiện tượng'].sort(() => Math.random() - 0.5),
        correct: combo.rxn === 'Thế' ? 'Không hiện tượng' : 'Mất màu dung dịch',
        lab: {
           chemical_1: combo.name, chemical_2: 'Br2',
           effect: combo.rxn === 'Thế' ? 'none' : 'color_change',
           color: '#fcd34d'
        }
      });
    } else {
      allQuestions.push({
        id: `q4_${idCounter++}`,
        chapter: 'chuong_4',
        type: 'ly_thuyet',
        difficulty: diff,
        question: diff === 'nhan_biet' ? getNbQ(combo.name, idCounter) : 
                  diff === 'thong_hieu' ? getThQ1(combo.name, idCounter) : 
                  getVdQ1(combo.name, idCounter),
        options: diff === 'nhan_biet' ? [combo.ans, ...combo.wrong].sort(() => Math.random() - 0.5) :
                 diff === 'thong_hieu' ? ['Cộng', 'Thế', 'Tách', 'Phân hủy'].sort(() => Math.random() - 0.5) :
                 [combo.o2, (parseFloat(combo.o2)+1).toString(), (parseFloat(combo.o2)+2).toString(), (parseFloat(combo.o2)-1).toString()].sort(() => Math.random() - 0.5),
        correct: diff === 'nhan_biet' ? combo.ans : 
                 diff === 'thong_hieu' ? combo.rxn :
                 combo.o2
      });
    }
  }

  // Chapter 5: Halogen Derivatives - Alcohol - Phenol
  const ancolCombos = [
    { name: 'CH3OH', ans: 'Methanol', wrong: ['Ethanol', 'Propanol', 'Phenol'], oxi: 'Aldehyde' },
    { name: 'C2H5OH', ans: 'Ethanol', wrong: ['Methanol', 'Propanol', 'Phenol'], oxi: 'Aldehyde' },
    { name: 'C3H7OH', ans: 'Propanol', wrong: ['Ethanol', 'Butanol', 'Methanol'], oxi: 'Aldehyde' },
    { name: 'CH3CH(OH)CH3', ans: 'Isopropanol', wrong: ['Propanol', 'Ethanol', 'Butanol'], oxi: 'Ketone' },
    { name: 'C4H9OH', ans: 'Butanol', wrong: ['Propanol', 'Pentanol', 'Ethanol'], oxi: 'Aldehyde' },
    { name: 'C6H5OH', ans: 'Phenol', wrong: ['Benzyl alcohol', 'Ethanol', 'Toluene'], oxi: 'Không phản ứng' },
    { name: 'C2H4(OH)2', ans: 'Ethylene glycol', wrong: ['Glycerol', 'Propanol', 'Ethanol'], oxi: 'Aldehyde' },
    { name: 'C3H5(OH)3', ans: 'Glycerol', wrong: ['Ethylene glycol', 'Propanol', 'Ethanol'], oxi: 'Aldehyde' },
    { name: 'CH3Cl', ans: 'Chloromethane', wrong: ['Chloroethane', 'Dichloromethane', 'Methanol'], oxi: 'Không' },
    { name: 'C2H5Cl', ans: 'Chloroethane', wrong: ['Chloromethane', 'Bromoethane', 'Ethanol'], oxi: 'Không' },
    { name: 'CHCl3', ans: 'Chloroform', wrong: ['Dichloromethane', 'Carbon tetrachloride', 'Chloromethane'], oxi: 'Không' },
    { name: 'CCl4', ans: 'Carbon tetrachloride', wrong: ['Chloroform', 'Dichloromethane', 'Methane'], oxi: 'Không' }
  ];

  for (let i = 0; i < 80; i++) {
    const isLab = i < 20;
    const combo = ancolCombos[i % ancolCombos.length];
    let diff: Difficulty = 'nhan_biet';
    if (i % 10 >= 4 && i % 10 < 7) diff = 'thong_hieu';
    if (i % 10 >= 7) diff = 'van_dung';

    if (isLab) {
      allQuestions.push({
        id: `q5_lab_${idCounter++}`,
        chapter: 'chuong_5',
        type: 'thi_nghiem',
        difficulty: diff,
        question: combo.name === 'C6H5OH' ? `Nhỏ nước Br2 vào dung dịch ${combo.name}. Hiện tượng quan sát được là gì? (Mã ${idCounter})` : `Thí nghiệm: Cho một mẩu Na vào ống nghiệm chứa ${combo.name}. Hiện tượng xảy ra là? (Mã ${idCounter})`,
        options: ['Có khí không màu thoát ra', 'Kết tủa trắng', 'Dung dịch đổi màu xanh', 'Kết tủa đỏ gạch'].sort(() => Math.random() - 0.5),
        correct: combo.name === 'C6H5OH' ? 'Kết tủa trắng' : 'Có khí không màu thoát ra',
        lab: {
           chemical_1: combo.name, chemical_2: combo.name === 'C6H5OH' ? 'Br2' : 'Na',
           effect: combo.name === 'C6H5OH' ? 'precipitate' : 'gas', color: '#ffffff'
        }
      });
    } else {
      allQuestions.push({
        id: `q5_${idCounter++}`,
        chapter: 'chuong_5',
        type: 'ly_thuyet',
        difficulty: diff,
        question: diff === 'nhan_biet' ? getNbQ(combo.name, idCounter) :
                  diff === 'thong_hieu' ? `${combo.name} có phản ứng với NaOH trong điều kiện thường không? (Mã ${idCounter})` :
                  `Khi oxi hóa ${combo.name} bằng CuO (nhiệt độ), sản phẩm thu được thuộc loại hợp chất nào? (Mã ${idCounter})`,
        options: diff === 'nhan_biet' ? [combo.ans, ...combo.wrong].sort(() => Math.random() - 0.5) :
                 diff === 'thong_hieu' ? ['Có', 'Không', 'Chỉ khi đun nóng', 'Phản ứng thuận nghịch'].sort(() => Math.random() - 0.5) :
                 ['Aldehyde', 'Ketone', 'Carboxylic Acid', 'Không phản ứng', 'Không'].filter(x => x !== combo.oxi).slice(0, 3).concat([combo.oxi]).sort(() => Math.random() - 0.5),
        correct: diff === 'nhan_biet' ? combo.ans :
                 diff === 'thong_hieu' ? (combo.name === 'C6H5OH' ? 'Có' : 'Không') :
                 combo.oxi
      });
    }
  }

  // Chapter 6: Carbonyl - Carboxylic Acid
  const acidCombos = [
    { name: 'HCHO', ans: 'Formaldehyde', wrong: ['Acetaldehyde', 'Formic acid', 'Methanol'], type: 'aldehyde' },
    { name: 'CH3CHO', ans: 'Acetaldehyde', wrong: ['Formaldehyde', 'Acetic acid', 'Acetone'], type: 'aldehyde' },
    { name: 'C2H5CHO', ans: 'Propionaldehyde', wrong: ['Acetaldehyde', 'Butyraldehyde', 'Propanol'], type: 'aldehyde' },
    { name: 'CH3COCH3', ans: 'Acetone', wrong: ['Acetaldehyde', 'Propanal', 'Butanone'], type: 'ketone' },
    { name: 'HCOOH', ans: 'Formic acid', wrong: ['Acetic acid', 'Formaldehyde', 'Methanol'], type: 'acid' },
    { name: 'CH3COOH', ans: 'Acetic acid', wrong: ['Formic acid', 'Propionic acid', 'Ethanol'], type: 'acid' },
    { name: 'C2H5COOH', ans: 'Propionic acid', wrong: ['Acetic acid', 'Butyric acid', 'Propanol'], type: 'acid' },
    { name: 'HOOC-COOH', ans: 'Oxalic acid', wrong: ['Formic acid', 'Acetic acid', 'Malonic acid'], type: 'acid' }
  ];

  for (let i = 0; i < 80; i++) {
    const isLab = i < 20;
    const combo = acidCombos[i % acidCombos.length];
    let diff: Difficulty = 'nhan_biet';
    if (i % 10 >= 4 && i % 10 < 7) diff = 'thong_hieu';
    if (i % 10 >= 7) diff = 'van_dung';

    if (isLab) {
      const isAcid = combo.type === 'acid';
      allQuestions.push({
        id: `q6_lab_${idCounter++}`,
        chapter: 'chuong_6',
        type: 'thi_nghiem',
        difficulty: diff,
        question: isAcid ? `Cho dung dịch Na2CO3 vào cốc chứa ${combo.name}. Hiện tượng gì sẽ xảy ra? (Mã ${idCounter})` : `Thực hiện phản ứng tráng gương (AgNO3/NH3) với ${combo.name}. Nhận xét hiện tượng: (Mã ${idCounter})`,
        options: ['Sủi bọt khí', 'Xuất hiện lớp bạc sáng bóng', 'Kết tủa đỏ gạch', 'Dung dịch mất màu', 'Không hiện tượng'].sort(() => Math.random() - 0.5).slice(0, 4),
        correct: isAcid ? 'Sủi bọt khí' : (combo.type === 'ketone' ? 'Không hiện tượng' : 'Xuất hiện lớp bạc sáng bóng'),
        lab: {
           chemical_1: combo.name, chemical_2: isAcid ? 'Na2CO3' : 'AgNO3/NH3',
           effect: isAcid ? 'gas' : (combo.type === 'ketone' ? 'none' : 'color_change'),
           color: isAcid ? 'transparent' : '#c0c0c0'
        }
      });
    } else {
      allQuestions.push({
        id: `q6_${idCounter++}`,
        chapter: 'chuong_6',
        type: 'ly_thuyet',
        difficulty: diff,
        question: diff === 'nhan_biet' ? getNbQ(combo.name, idCounter) :
                  diff === 'thong_hieu' ? `Phân tử chất ${combo.name} có tham gia phản ứng tráng bạc không? (Mã ${idCounter})` :
                  `Đốt cháy một ${combo.type === 'aldehyde' ? 'anđehit' : combo.type === 'ketone' ? 'xeton' : 'axit'} no, đơn chức mạch hở như ${combo.name} cho ta tỉ lệ mol CO2 : H2O là? (Mã ${idCounter})`,
        options: diff === 'nhan_biet' ? [combo.ans, ...combo.wrong].sort(() => Math.random() - 0.5) :
                 diff === 'thong_hieu' ? ['Có', 'Không', 'Chỉ trong môi trường axit', 'Tùy điều kiện'].sort(() => Math.random() - 0.5) :
                 ['1:1', '1:2', '2:1', 'Chưa xác định'].sort(() => Math.random() - 0.5),
        correct: diff === 'nhan_biet' ? combo.ans :
                 diff === 'thong_hieu' ? (combo.type === 'aldehyde' ? 'Có' : 'Không') :
                 '1:1'
      });
    }
  }

  return allQuestions;
}

export const QUESTION_BANK = generateMockQuestions();
