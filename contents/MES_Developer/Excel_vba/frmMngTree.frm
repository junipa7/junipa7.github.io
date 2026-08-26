VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmMngTree 
   Caption         =   "기준정보 계층 트리"
   ClientHeight    =   6945
   ClientLeft      =   45
   ClientTop       =   375
   ClientWidth     =   5850
   OleObjectBlob   =   "frmMngTree.frx":0000
   StartUpPosition =   1  'CenterOwner
End
Attribute VB_Name = "frmMngTree"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False

Option Explicit

Public Sub Worksheet_Link(sManagement As String)
    Call modADO.SelectToTreeview("dbo.BOM_Tree_Select '" & sManagement & "'", Me.TreeView1)
End Sub

Private Sub cmdClose_Click()
    Unload Me
End Sub
