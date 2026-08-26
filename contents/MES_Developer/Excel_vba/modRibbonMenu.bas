Attribute VB_Name = "modRibbonMenu"
Private Const ThisModuleVersion As Integer = 2

Option Explicit   '변수 선언 강제

'Callback for customButton1 onAction
'Ribbon Menu 에디터 사이트 연결
Sub conRibbonXEditorHttpSub(control As IRibbonControl)
    ActiveWorkbook.FollowHyperlink "https://github.com/fernandreu/office-ribbonx-editor"
End Sub

'Callback for customButton2 onAction
'마스터 Sheet의 작업자 입력란으로 이동
Sub conWorkerChangeSub(control As IRibbonControl)
    MES_Master.Activate
    MES_Master.Range("WORKER").Select
End Sub

'Callback for customButton3 onAction
'마스터 Sheet의 서버 설정란으로 이동
Sub conSQLServerChangeSub(control As IRibbonControl)
    MES_Master.Activate
    Range("SERVER").Select
End Sub

'Callback for customButton3 onAction
'공정 Master Sheet 생성 매크로 호출
Sub conMES_Product_Process(control As IRibbonControl)
    Call Create_MES_Product_Process
End Sub

'Callback for MES_UserInfo getText
'리본 메뉴에 현재 작업자 명칭 표시
Sub MES_Master_User_getText(control As IRibbonControl, ByRef returnedVal)
    returnedVal = MES_Master.Range("WORKER").text
End Sub

'Callback for MES_UserInfo onChange
'작업자 변경 시 워크시트에 동기화
Sub MES_Master_User_Change(control As IRibbonControl, text As String)
    MES_Master.Range("WORKER").value = text
End Sub

'Callback for MES_ServerInfo onChange
'서버 변경 시 워크시트에 자동 반영
Sub MES_Master_Server(control As IRibbonControl, text As String)
    Range("SERVER").value = text
End Sub

Sub MES_Master_Server_getText(control As IRibbonControl, ByRef returnedVal)
    returnedVal = Range("SERVER").text
End Sub

'Callback for MES_ExcelSave onAction
'전체 모듈 소스코드 DB 저장
Sub MES_ProgramSave(control As IRibbonControl)
    Call UpgradeModuleSave
End Sub

'Callback for MES_ExcelLoad onAction
'DB에서 최신 모듈 소스코드 핫패치 로딩
Sub MES_ProgramLoad(control As IRibbonControl)
    Call UpgradeModuleLoad
End Sub

'Sheet 이름이 존재하는지 확인하는 유틸 함수
Private Function FindSheetName(sSheetName As String) As Boolean
    Dim xSheet As Worksheet
    
    On Error GoTo ExitLab
    For Each xSheet In ActiveWorkbook.Sheets
        If xSheet.Name = sSheetName Then
            FindSheetName = True
            Exit Function
        End If
ExitLab:
    Next
    
    FindSheetName = False
End Function
