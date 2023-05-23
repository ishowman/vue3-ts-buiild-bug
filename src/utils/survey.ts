import { newsTypes } from '@/constants';
import { NumbericBoolean } from '@/types';
import type { DateModelType } from 'element-plus';
export interface IAnswer {
  id?: string;
  text: string;
}

export interface ISurvey {
  id?: string;
  answers?: IAnswer[];
  type: newsTypes;
  is_required: NumbericBoolean;
  text?: string;
  is_using_selectable_period?: boolean;
  use_text?: NumbericBoolean;
  available_answer_count?: number;
  period?: [DateModelType, DateModelType];
  is_multiple?: NumbericBoolean;
}

export function getSurveyAnswerModel(shouldHaveId): IAnswer {
  return {
    text: '',
    ...(shouldHaveId ? { id: 'null' } : {}),
  };
}

export function getSurveyByType(
  type: newsTypes,
  shouldHaveId: boolean
): ISurvey {
  const surveyAnswer = getSurveyAnswerModel(shouldHaveId);
  const answers = [{ ...surveyAnswer }, { ...surveyAnswer }];
  const commonSurvey = {
    text: '',
    is_required: NumbericBoolean.false,
    ...(shouldHaveId ? { id: 'null' } : {}),
  };
  switch (type) {
    case newsTypes.choice:
      return {
        ...commonSurvey,
        type,
        use_text: NumbericBoolean.false,
        answers,
        is_multiple: NumbericBoolean.false,
      };
    case newsTypes.month:
    case newsTypes.date:
      return {
        ...commonSurvey,
        type,
        available_answer_count: 1,
        is_using_selectable_period: false,
        period: ['', ''],
      };

    default:
      return {
        ...commonSurvey,
        type,
      };
  }
}

export function validateSurveys(surveys: ISurvey[]) {
  let areValidSurveys = true;
  let errMsg = '';

  areValidSurveys = surveys.every((survey) => {
    return (
      !survey.is_using_selectable_period ||
      (survey.is_using_selectable_period &&
        survey?.period?.length === 2 &&
        new Date(survey.period[0]).getTime() <
          new Date(survey.period[1]).getTime())
    );
  });

  if (!areValidSurveys) {
    errMsg = '有効な選択可能期間を指定してください';
    return {
      areValidSurveys,
      errMsg,
    };
  }

  for (const i in surveys) {
    const survey = surveys[i];
    const answerTexts: string[] = [];
    if (survey.type === newsTypes.choice) {
      for (const j in survey.answers) {
        const answer = survey.answers[j];
        if (answer?.text === '') {
          // not allowed to be empty when submit
          areValidSurveys = false;
          errMsg = `質問${+i + 1}の回答${+j + 1}. 内容を入力してください`;

          break;
        }
        if (answerTexts.includes(answer.text)) {
          // not allowed to repeat when submit
          areValidSurveys = false;
          errMsg = `回答に同じ内容は使えません`;
          break;
        }
        answerTexts.push(answer.text);
      }
    }
  }

  return {
    areValidSurveys,
    errMsg,
  };
}
