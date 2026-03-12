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
            },
            profile: {
                tooltip: "Profile Settings / Logout",
                guest: "Guest"
            },
            checklist: {
                title: "Checklist",
                noTasks: "No tasks yet. Add one below.",
                placeholder: "Add a new task...",
                add: "Add",
                delete: "Delete item"
            },
            timer: {
                title: "Timer",
                clickToEdit: "Click to edit time",
                start: "Start",
                pause: "Pause",
                reset: "Reset",
                full: "Full",
                exit: "Exit",
                close: "Close Timer"
            },
            calculator: {
                title: "Calculator"
            },
            modals: {
                save: {
                    title: "Save Canvas",
                    storage: "Storage",
                    cloud: "Google Cloud (Firestore)",
                    local: "Local Storage (Browser)",
                    loggedInAs: "Logged in as",
                    fileName: "File Name",
                    fileNamePlaceholder: "My Awesome Canvas",
                    existingFiles: "Existing Files (Select to overwrite)",
                    noFiles: "No saved files yet.",
                    cancel: "Cancel",
                    saveOverwrite: "Save (Overwrite)",
                    saveAsNew: "Save as New",
                    saveBtn: "Save"
                },
                load: {
                    title: "Load Canvas",
                    source: "Source",
                    noCanvases: "No saved canvases found.",
                    lastSaved: "Last saved",
                    loadBtn: "Load",
                },
                share: {
                    title: "Share Canvas",
                    generating: "Generating link...",
                    yourLink: "Your unique share link:",
                    copy: "Copy",
                    description: "Click the button below to generate a unique link to share this canvas. Anyone with the link will be able to view and load it.",
                    generateBtn: "Generate Share Link"
                },
                prompts: {
                    logout: "Are you sure you want to log out?",
                    newCanvas: "Are you sure you want to create a new canvas? This will clear the current canvas and cannot be undone.",
                    emailCopied: "Email copied to clipboard!",
                    linkCopied: "Link copied to clipboard!"
                }
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
            },
            profile: {
                tooltip: "프로필 설정 / 로그아웃",
                guest: "게스트"
            },
            checklist: {
                title: "체크리스트",
                noTasks: "아직 할 일이 없습니다. 아래에 추가해 보세요.",
                placeholder: "새로운 할 일 추가...",
                add: "추가",
                delete: "항목 삭제"
            },
            timer: {
                title: "타이머",
                clickToEdit: "클릭하여 시간 수정",
                start: "시작",
                pause: "일시정지",
                reset: "초기화",
                full: "전체화면",
                exit: "나가기",
                close: "타이머 닫기"
            },
            calculator: {
                title: "계산기"
            },
            modals: {
                save: {
                    title: "캔버스 저장",
                    storage: "저장 위치",
                    cloud: "구글 클라우드 (Firestore)",
                    local: "로컬 저장소 (웹 브라우저)",
                    loggedInAs: "로그인 계정",
                    fileName: "파일 이름",
                    fileNamePlaceholder: "나의 멋진 캔버스",
                    existingFiles: "기존 파일 (덮어쓰려면 선택)",
                    noFiles: "아직 저장된 파일이 없습니다.",
                    cancel: "취소",
                    saveOverwrite: "저장 (덮어쓰기)",
                    saveAsNew: "새로 저장",
                    saveBtn: "저장"
                },
                load: {
                    title: "캔버스 불러오기",
                    source: "가져올 위치",
                    noCanvases: "저장된 캔버스가 없습니다.",
                    lastSaved: "마지막 저장 시간",
                    loadBtn: "불러오기",
                },
                share: {
                    title: "캔버스 공유",
                    generating: "링크 생성 중...",
                    yourLink: "고유 공유 링크:",
                    copy: "복사",
                    description: "아래 버튼을 클릭하여 이 캔버스를 공유할 수 있는 고유 링크를 생성하세요. 링크가 있는 누구나 캔버스를 보고 불러올 수 있습니다.",
                    generateBtn: "공유 링크 생성"
                },
                prompts: {
                    logout: "정말로 로그아웃 하시겠습니까?",
                    newCanvas: "새로운 캔버스를 여시겠습니까? 현재 캔버스의 모든 내용이 지워지며 복구할 수 없습니다.",
                    emailCopied: "이메일이 클립보드에 복사되었습니다!",
                    linkCopied: "링크가 클립보드에 복사되었습니다!"
                }
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
            },
            profile: {
                tooltip: "プロファイル設定 / ログアウト",
                guest: "ゲスト"
            },
            checklist: {
                title: "チェックリスト",
                noTasks: "タスクはまだありません。以下に追加してください。",
                placeholder: "新しいタスクを追加...",
                add: "追加",
                delete: "アイテムを削除"
            },
            timer: {
                title: "タイマー",
                clickToEdit: "クリックして時間を編集",
                start: "開始",
                pause: "一時停止",
                reset: "リセット",
                full: "全画面表示",
                exit: "終了",
                close: "タイマーを閉じる"
            },
            calculator: {
                title: "電卓"
            },
            modals: {
                save: {
                    title: "キャンバスを保存",
                    storage: "保存先",
                    cloud: "Googleクラウド (Firestore)",
                    local: "ローカルストレージ (ブラウザ)",
                    loggedInAs: "ログインアカウント",
                    fileName: "ファイル名",
                    fileNamePlaceholder: "私の素晴らしいキャンバス",
                    existingFiles: "既存のファイル (上書きする場合は選択)",
                    noFiles: "保存されたファイルはまだありません。",
                    cancel: "キャンセル",
                    saveOverwrite: "保存 (上書き)",
                    saveAsNew: "新しく保存",
                    saveBtn: "保存"
                },
                load: {
                    title: "キャンバスを読み込む",
                    source: "ソース",
                    noCanvases: "保存されたキャンバスが見つかりません。",
                    lastSaved: "最終保存",
                    loadBtn: "読み込む",
                },
                share: {
                    title: "キャンバスを共有",
                    generating: "リンクを生成中...",
                    yourLink: "一意の共有リンク:",
                    copy: "コピー",
                    description: "下のボタンをクリックして、このキャンバスを共有するためのリンクを生成します。リンクを知っている人は誰でも表示して読み込むことができます。",
                    generateBtn: "共有リンクを生成"
                },
                prompts: {
                    logout: "本当にログアウトしますか？",
                    newCanvas: "本当に新しいキャンバスを作成しますか？現在のキャンバスはすべてクリアされ、元に戻すことはできません。",
                    emailCopied: "メールがクリップボードにコピーされました！",
                    linkCopied: "リンクがクリップボードにコピーされました！"
                }
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
