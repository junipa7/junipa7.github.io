VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "MES_Process"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Private Const ThisModuleVersion As Integer = 1

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

Private sDataList() As String 'Sheet에서 내용을 수정하면 어느행이 수정되었는지 저장

'개발시 변경해야할 위치
'↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
Private Const QUERY_SELECT As String = "dbo.Process_Select"
Private Const QUERY___SAVE As String = "dbo.Process_Save"
Private Const QUERY_DELETE As String = "dbo.Process_Delete"

'선택 쿼리 실행시 파라메터
Private Function QuerySelectParameter() As String
    QuerySelectParameter = "'" + Range("WORK").value + "'"
End Function
'삭제 쿼리 실행시 파라메터
Private Function QueryDeleteParameter(iRownumber As Long) As String
    QueryDeleteParameter = "'" + Range("DATA").Cells(iRownumber, 1).text + "'"
End Function
'Sheet의 값이 바뀌면 자동으로 변경할 값 정의
Private Sub AutoChangeValue(iRownumber As Long)
    Range("DATA").Cells(iRownumber, 6).value = DateTime.Now()
    Range("DATA").Cells(iRownumber, 7).value = MES_Master.Range("WORKER").text
End Sub

'실행전 초기화 해야할 변수
Private Sub Worksheet_Activate()
    Static bInitflag As Boolean
    
    If bInitflag = False Then
         '배열변수의 크기를 재조정
        ReDim sDataList(Range("DATA").Rows.Count)
        
        '코드정보를 Sheet에 몰록형태로 입력제약을 걸어준다.
        Call RangeCode_Set(Range("DATA").Columns(3), CodeList_Select("Process.Work"))
        Call RangeCode_Set(Range("DATA").Columns(4), CodeList_Select("Process.Type"))
        Call RangeCode_Set(Range("DATA").Columns(5), "Y,N")
        Call RangeCode_Set(Range("WORK"), "전체," & Range("DATA").Columns(4).Validation.Formula1)
        
        bInitflag = True
    End If
End Sub
'↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑


'조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDisplay_Click()
    Dim sSQL As String
      
    '취소선 삭제
    Call DeleteLine_Cancel(Range("DATA"))
    
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = QUERY_SELECT + " " + QuerySelectParameter()
    
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("DATA"))
    
    '조회를 다시한 경우에는 배열을 초기화하여 지정된 DELETE/SAVE 를 없앤다.
    ReDim sDataList(Range("DATA").Rows.Count)
    
    '날자컬럼의 표시형식 변경
    Call DateFromatSet(Range("DATA").Columns(6))

End Sub

'삭제조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDelete_Click()
    Dim iDataRow As Long
    
    'Sheet에서 Data범위 내의 Data가 변경되었는지 확인
    If Change_Check(ActiveCell, Range("DATA")) Then
        
        'Active된 Cell주소에서 Data영역의 시작주소의 차이를 이용하여 Row번호를 구한다.
        iDataRow = ActiveCell.Row - Range("DATA").Row + 1
   
        If sDataList(iDataRow) = "DELETE" Then
        
            '이미 삭제되어 있으면 삭제 취소
            sDataList(iDataRow) = ""
            
            '취소선 삭제
            Call DeleteLine_Cancel(Range("DATA").Rows(iDataRow))
        Else
            'Data범위 내면 변수에 DELETE 지정
            sDataList(iDataRow) = "DELETE"
            
            '취소선을 표시하고 문자를 빨간색으로 변경
            Call DeleteLine_Create(Range("DATA").Rows(iDataRow))
        End If
    End If
        
End Sub

'저장조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdSave_Click()
    Dim iDataRow As Long
    Dim sSQL As String
   
    For iDataRow = 1 To Range("DATA").Rows.Count
        If sDataList(iDataRow) = "DELETE" Then
            '취소선 삭제
            Call DeleteLine_Cancel(Range("DATA").Rows(iDataRow))
            '삭제인 경우 호출할 명령 지정
            sSQL = QUERY_DELETE + " " + QueryDeleteParameter(iDataRow)
            Call ExecCmd(sSQL)
        ElseIf sDataList(iDataRow) = "SAVE" Then
            '저장인 경우 호출할 명령 지정
            sSQL = QUERY___SAVE + " " + DataList_Create(Range("DATA").Rows(iDataRow))
            Call ExecCmd(sSQL)
        End If
        '첫번째 열이 공백이면 배열의 끝까지 가지않고 바로종료
        If Range("DATA").Cells(iDataRow, 1) = "" Then
            Exit For
        End If
    
    Next
    
    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
    
End Sub

'Cell에서 Data수정이 발생하면 실행되는 Event
Private Sub Worksheet_Change(ByVal Target As Range)
    Dim iDataRow As Long
    
    'Sheet에 Data를 뿌리는 중이면 바로 빠져나감.
    If Application.ScreenUpdating = False Then
        Exit Sub
    End If

    '3행 이후의 Data가 변경되었는지 확인
    If Change_Check(Target, Range("DATA")) Then
        
        'Active된 Cell주소에서 Data영역의 시작주소의 차이를 이용하여 Row번호를 구한다.
        iDataRow = Target.Row - Range("DATA").Row + 1
        
        '수정에 의한 무한 루프를 방지 한다
        Application.ScreenUpdating = False
        
        Call AutoChangeValue(iDataRow)
        
        Application.ScreenUpdating = True
        
        '변경된 Data행의 Range를 구한단.
        '변경 Range에 Data가 미입력된 Cell이 있는지 확인한다.
        If AllDataInput_Check(Range("DATA").Rows(iDataRow)) Then
            sDataList(iDataRow) = "SAVE"
        End If
    End If

End Sub
