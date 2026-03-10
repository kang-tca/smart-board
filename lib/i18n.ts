import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation strings
const resources = {
    en: {
        translation: {
            auth: {
                title: "Smart Board",
                subtitle: "Organize, annotate, and share your PDF materials",
                with: "with an interactive digital whiteboard.",
                email: "Email",
                password: "Password",
                signIn: "Sign In",
                signUp: "Sign Up",
                noAccount: "Don't have an account?",
                hasAccount: "Already have an account?",
                guestPrompt: "Or just want to look around?",
                continueGuest: "Continue as Guest",
                rights: "Smart Board. All rights reserved."
            },
            toolbar: {
                select: "Select & Move Item (V)",
                hand: "Pan Canvas (Space + Drag)",
                laser: "Laser Pointer",
                pen: "Pen Tool (P)",
                eraser: "Eraser (E)",
                text: "Add Text (T)",
                image: "Insert Image",
                shapes: "Shapes",
                undo: "Undo (Ctrl+Z)",
                redo: "Redo (Ctrl+Shift+Z)",
                present: "Present Page",
                newCanvas: "New Canvas (Ctrl+N)",
                checklist: "Checklist",
                classroom: "Classroom",
                raffle: "Presenter Raffle",
                calculator: "Calculator",
                timer: "Timer",
                clear: "Clear Canvas",
                save: "Save to Cloud (Ctrl+S)",
                load: "Load from Cloud (Ctrl+L)",
                share: "Share Canvas",
                upload: "Upload PDF(s)"
            },
            settings: {
                title: "Settings",
                language: "Language",
                close: "Close"
            },
            canvas: {
                loading: "Loading Smart Board...",
                resetZoom: "Reset Zoom to 100%",
                gridToggle: "Toggle Grid",
                page: "Page",
                fitScreen: "Fit to Screen"
            }
        }
    },
    ko: {
        translation: {
            auth: {
                title: "스마트 칠판",
                subtitle: "대화형 디지털 화이트보드로",
                with: "PDF 자료를 정리하고, 필기하고, 공유하세요.",
                email: "이메일",
                password: "비밀번호",
                signIn: "로그인",
                signUp: "회원가입",
                noAccount: "계정이 없으신가요?",
                hasAccount: "이미 계정이 있으신가요?",
                guestPrompt: "아니면 바로 둘러보실래요?",
                continueGuest: "게스트로 계속하기",
                rights: "Smart Board. 모든 권리 보유."
            },
            toolbar: {
                select: "선택 및 이동 (V)",
                hand: "화면 이동 (Space + 드래그)",
                laser: "레이저 포인터",
                pen: "펜 도구 (P)",
                eraser: "지우개 (E)",
                text: "텍스트 추가 (T)",
                image: "이미지 삽입",
                shapes: "도형",
                undo: "실행 취소 (Ctrl+Z)",
                redo: "다시 실행 (Ctrl+Shift+Z)",
                present: "현재 페이지 발표",
                newCanvas: "새 캔버스 (Ctrl+N)",
                checklist: "체크리스트",
                classroom: "클래스룸",
                raffle: "발표자 뽑기",
                calculator: "계산기",
                timer: "타이머",
                clear: "캔버스 지우기",
                save: "클라우드에 저장 (Ctrl+S)",
                load: "클라우드에서 불러오기 (Ctrl+L)",
                share: "캔버스 공유",
                upload: "PDF 파일 업로드"
            },
            settings: {
                title: "설정",
                language: "언어 선택",
                close: "닫기"
            },
            canvas: {
                loading: "스마트 칠판을 불러오는 중입니다...",
                resetZoom: "100% 비율로 되돌리기",
                gridToggle: "눈금자(그리드) 표시/숨기기",
                page: "페이지",
                fitScreen: "화면에 맞추기"
            }
        }
    },
    ja: {
        translation: {
            auth: {
                title: "スマートボード",
                subtitle: "インタラクティブなデジタルホワイトボードで",
                with: "PDF資料を整理し、注釈を付け、共有しましょう。",
                email: "メールアドレス",
                password: "パスワード",
                signIn: "ログイン",
                signUp: "サインアップ",
                noAccount: "アカウントをお持ちでないですか？",
                hasAccount: "すでにアカウントをお持ちですか？",
                guestPrompt: "まずは見てみたいですか？",
                continueGuest: "ゲストとして続行",
                rights: "Smart Board. 無断複写・転載を禁じます."
            },
            toolbar: {
                select: "アイテムの選択と移動 (V)",
                hand: "キャンバスの移動 (Space + ドラッグ)",
                laser: "レーザーポインター",
                pen: "ペンツール (P)",
                eraser: "消しゴム (E)",
                text: "テキストの追加 (T)",
                image: "画像の挿入",
                shapes: "図形",
                undo: "元に戻す (Ctrl+Z)",
                redo: "やり直す (Ctrl+Shift+Z)",
                present: "現在のページをプレゼン",
                newCanvas: "新しいキャンバス (Ctrl+N)",
                checklist: "チェックリスト",
                classroom: "クラスルーム",
                raffle: "プレゼンター抽選",
                calculator: "電卓",
                timer: "タイマー",
                clear: "キャンバスをクリア",
                save: "クラウドに保存 (Ctrl+S)",
                load: "クラウドから読み込み (Ctrl+L)",
                share: "キャンバスを共有",
                upload: "PDFのアップロード"
            },
            settings: {
                title: "設定",
                language: "言語の選択",
                close: "閉じる"
            },
            canvas: {
                loading: "スマートボードを読み込んでいます...",
                resetZoom: "100%にリセット",
                gridToggle: "グリッドの切り替え",
                page: "ページ",
                fitScreen: "画面に合わせる"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        // Default language is Korean, fallback to English
        fallbackLng: 'ko',
        interpolation: {
            escapeValue: false // React already safely escapes strings
        }
    });

export default i18n;
