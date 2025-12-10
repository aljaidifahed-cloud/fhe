import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { useLanguage } from '../contexts/LanguageContext';
import { getOrgHierarchy, assignManager, deleteEmployee, addEmployee, getNextEmployeeId, getEmployees } from '../services/mockService';
import { OrgTreeNode, Employee } from '../types';
import { Page } from '../types';
import { ArrowPathIcon, MinusIcon, PlusIcon, ArrowsPointingOutIcon, UserPlusIcon, TrashIcon, ArrowRightStartOnRectangleIcon, MagnifyingGlassIcon, XMarkIcon, BriefcaseIcon, UsersIcon } from '@heroicons/react/24/outline';

const containerStyles = {
  width: '100%',
  height: '70vh',
};

interface OrgChartProps {
  onNavigate?: (page: Page) => void;
}

export const OrgChart: React.FC<OrgChartProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [treeData, setTreeData] = useState<OrgTreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRole, setSearchRole] = useState('');

  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);
  const [moveMode, setMoveMode] = useState<{ active: boolean, sourceId: string | null }>({ active: false, sourceId: null });
  const [pendingAssignment, setPendingAssignment] = useState<{ id: string, name: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'existing' | 'new'>('existing');
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isEmployeeListOpen, setIsEmployeeListOpen] = useState(false);
  const [employeeListSearch, setEmployeeListSearch] = useState('');

  // New Employee Form State
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeePosition, setNewEmployeePosition] = useState('');
  const [newEmployeeDept, setNewEmployeeDept] = useState('');

  useEffect(() => {
    fetchOrgData();
  }, []);

  useEffect(() => {
    if (containerRef.current && treeData && !selectedNodeId) {
      const dimensions = containerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: 50
      });
    }
  }, [treeData, containerRef]);

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      const data = await getOrgHierarchy();
      setTreeData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const emps = await getEmployees();
      // Filter out those who are already in the tree? 
      // For now, let's just show all to allow moving people who already have managers (re-assigning)
      setEmployeesList(emps);
    } catch (e) {
      console.error(e);
    }
  };

  // ACTIONS
  const handleNodeClick = (nodeDatum: any) => {
    if (moveMode.active && moveMode.sourceId) {
      // We are sticking a node to this target
      handleMoveConfirm(nodeDatum.attributes.id);
    } else if (pendingAssignment) {
      // We are assigning the pending employee to this node
      handleAssignToNode(nodeDatum.attributes.id);
    } else {
      // Just selecting
      if (selectedNodeId === nodeDatum.attributes.id) {
        setSelectedNodeId(null);
        setSelectedNodeName(null);
      } else {
        setSelectedNodeId(nodeDatum.attributes.id);
        setSelectedNodeName(nodeDatum.name);
      }
    }
  };

  const handleOpenAddModal = async () => {
    if (!selectedNodeId) return;
    await fetchEmployeesList();
    // Reset Form
    setModalTab('existing');
    setSelectedEmployeeId('');
    setNewEmployeeName('');
    setNewEmployeePosition(t('default_position'));
    setNewEmployeeDept(t('default_dept'));
    setIsModalOpen(true);
  };

  const handleOpenEmployeeList = async () => {
    await fetchEmployeesList();
    setIsEmployeeListOpen(true);
  };

  const handleAssignFromList = async (employeeId: string, employeeName: string) => {
    // If we have NO tree data, we are creating the root node
    if (!treeData) {
      if (confirm(t('confirm_set_root').replace('{name}', employeeName))) {
        try {
          await assignManager(employeeId, null);
          setIsEmployeeListOpen(false);
          fetchOrgData();
          alert(t('msg_root_assigned'));
        } catch (e: any) {
          alert(t('err_root_assign') + e.message);
        }
      }
      return;
    }

    if (!selectedNodeId) {
      // Enter "Placement Mode"
      setPendingAssignment({ id: employeeId, name: employeeName });
      setIsEmployeeListOpen(false);
      return;
    }

    try {
      await assignManager(employeeId, selectedNodeId);
      setIsEmployeeListOpen(false);
      fetchOrgData();
      alert(t('msg_emp_assigned'));
    } catch (e: any) {
      alert(t('err_assign') + e.message);
    }
  };

  const handleAssignToNode = async (targetNodeId: string) => {
    if (!pendingAssignment) return;
    try {
      await assignManager(pendingAssignment.id, targetNodeId);
      setPendingAssignment(null);
      fetchOrgData();
    } catch (e: any) {
      alert(t('err_assign') + e.message);
      setPendingAssignment(null);
    }
  };

  const handleConfirmAdd = async () => {
    // if (!selectedNodeId) return; // Allow null for root creation

    try {
      if (modalTab === 'existing') {
        if (!selectedEmployeeId) return alert(t('err_select_emp'));
        // If creating root (no selectedNodeId), we set manager to null (or specific root indicator?)
        // Actually, assignManager might need updates, but assuming handling null target as "make root" or just updating the managerId to null.
        // For now, let's treat "assign to null" as "make root" if that's the intention, OR just assume this flow is for adding NEW nodes as root for simplicity first, 
        // as moving an existing node to root is trickier if it has a manager.
        // Let's stick to creating NEW root for now or re-assigning if supported.
        await assignManager(selectedEmployeeId, selectedNodeId || null);
      } else {
        if (!newEmployeeName) return alert(t('err_enter_name'));

        const nextId = await getNextEmployeeId();
        const newEmployee: Employee = {
          id: nextId,
          companyId: 'COMP-001',
          managerId: selectedNodeId || null, // Allow null for root
          fullName: newEmployeeName,
          position: newEmployeePosition,
          department: newEmployeeDept,
          nationality: 'Saudi Arabia',
          iqamaOrNationalId: '0000000000',
          idExpiryDate: '2025-01-01',
          joinDate: new Date().toISOString().split('T')[0],
          email: `${newEmployeeName.replace(/\s/g, '.').toLowerCase()}@company.com`,
          iban: '',
          bankName: '',
          contract: {
            basicSalary: 5000,
            housingAllowance: 0,
            transportAllowance: 0,
            otherAllowance: 0
          }
        };
        await addEmployee(newEmployee);
      }

      fetchOrgData(); // Refresh tree
      setIsModalOpen(false);
    } catch (e: any) {
      alert(t('err_op_failed') + e.message);
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNodeId) return;
    if (!confirm(t('confirm_delete_node').replace('{name}', selectedNodeName || ''))) return;

    try {
      await deleteEmployee(selectedNodeId);
      setSelectedNodeId(null);
      setSelectedNodeName(null);
      fetchOrgData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const startMove = () => {
    if (!selectedNodeId) return;
    setMoveMode({ active: true, sourceId: selectedNodeId });
  };

  const handleMoveConfirm = async (targetId: string) => {
    if (!moveMode.sourceId) return;
    if (targetId === moveMode.sourceId) return; // Cannot move to self

    try {
      await assignManager(moveMode.sourceId, targetId);
      setMoveMode({ active: false, sourceId: null });
      setSelectedNodeId(null);
      fetchOrgData();
    } catch (e: any) {
      alert(e.message);
      setMoveMode({ active: false, sourceId: null });
    }
  };

  const cancelMove = () => {
    setMoveMode({ active: false, sourceId: null });
  };

  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
    const isSelected = selectedNodeId === nodeDatum.attributes.id;
    const isMoveSource = moveMode.active && moveMode.sourceId === nodeDatum.attributes.id;
    const isMoveTargetCandidate = moveMode.active && !isMoveSource;

    // Search Logic
    const matchesNameOrId = !searchQuery || (
      nodeDatum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nodeDatum.attributes.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesRole = !searchRole || (
      nodeDatum.attributes.position.toLowerCase().includes(searchRole.toLowerCase())
    );

    const isMatch = (searchQuery || searchRole) && matchesNameOrId && matchesRole;
    const isDimmed = (searchQuery || searchRole) && !isMatch;

    const getDeptColor = (dept: string) => {
      if (dept.includes('Executive')) return 'border-l-4 border-l-purple-500';
      if (dept.includes('Engineering')) return 'border-l-4 border-l-blue-500';
      if (dept.includes('HR')) return 'border-l-4 border-l-emerald-500';
      if (dept.includes('Sales')) return 'border-l-4 border-l-orange-500';
      return 'border-l-4 border-l-slate-400';
    };

    return (
      <g>
        <foreignObject width={280} height={130} x={-140} y={-50}>
          <div
            onClick={() => handleNodeClick(nodeDatum)}
            className={`
                    relative flex items-center p-3 rounded-xl shadow-lg transition-all 
                    cursor-pointer group overflow-hidden ${getDeptColor(nodeDatum.attributes.department)}
                    bg-white dark:bg-slate-800
                    ${isSelected ? 'ring-2 ring-emerald-500 transform scale-105' : 'border border-slate-200 dark:border-slate-700'}
                    ${isMoveSource ? 'opacity-50 border-dashed border-2 border-slate-400' : ''}
                    ${isMoveTargetCandidate ? 'hover:ring-2 hover:ring-blue-400' : ''}
                    ${isMatch ? 'ring-4 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 scale-105 z-50' : ''}
                    ${isDimmed && !isSelected ? 'opacity-30 grayscale' : 'opacity-100'}
                `}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 mr-4 rtl:mr-0 rtl:ml-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-300 border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden">
                {nodeDatum.attributes.avatarUrl ? (
                  <img src={nodeDatum.attributes.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{nodeDatum.name.charAt(0)}</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left rtl:text-right">
              <h3 className="text-sm font-bold text-black dark:text-white truncate">
                {nodeDatum.name}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate mb-0.5">
                {nodeDatum.attributes.position}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                  {nodeDatum.attributes.department}
                </p>
                <p className="text-[10px] font-mono text-slate-300 dark:text-slate-600">
                  {nodeDatum.attributes.id}
                </p>
              </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto text-emerald-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            )}
          </div>
        </foreignObject>
      </g>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
      <p className="text-slate-500">{t('msg_loading_data')}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-4 relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">{t('org_title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {moveMode.active ? t('org_msg_select_manager') :
              pendingAssignment ? `${t('org_msg_select_manager_for')} ${pendingAssignment.name}...` :
                t('org_msg_select_node')}
          </p>

        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse w-full md:w-auto">

          {/* Employee Directory Button */}
          <button
            onClick={handleOpenEmployeeList}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium border border-slate-200 dark:border-slate-600"
            title={t('directory')}
          >
            <UsersIcon className="w-5 h-5" />
            <span className="hidden sm:inline">{t('directory')}</span>
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t('search_placeholder_org')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-sm text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-64"
            />
          </div>

          {/* Role Filter */}
          <div className="relative flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
              <BriefcaseIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t('filter_role')}
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              className="pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-48"
            />
          </div>

          <div className="flex space-x-2 rtl:space-x-reverse">
            {moveMode.active && (
              <button
                onClick={cancelMove}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
              >
                {t('cancel_move')}
              </button>
            )}

            {pendingAssignment && (
              <button
                onClick={() => setPendingAssignment(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
              >
                {t('cancel_assignment')}
              </button>
            )}

            {!moveMode.active && !pendingAssignment && selectedNodeId && (
              <>
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center space-x-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium border border-emerald-200"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('add_sub')}</span>
                </button>
                <button
                  onClick={startMove}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                >
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('move_node')}</span>
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('delete_node')}</span>
                </button>
              </>
            )}

            <button
              onClick={() => fetchOrgData()}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title={t('org_reset')}
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden shadow-inner" ref={containerRef}>

        {/* Tree Container */}
        <div style={containerStyles}>
          {treeData ? (
            <Tree
              data={treeData}
              translate={translate}
              orientation="vertical"
              pathFunc="step"
              nodeSize={{ x: 300, y: 180 }}
              separation={{ siblings: 1.2, nonSiblings: 1.5 }}
              renderCustomNodeElement={renderCustomNodeElement}
              zoom={zoom}
              enableLegacyTransitions={true}
              transitionDuration={300}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <p>No organizational chart data available</p>
              <button
                onClick={handleOpenEmployeeList}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                <PlusIcon className="w-6 h-6" />
                <span className="font-bold">{t('create_root')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col space-y-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
          >
            <MinusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              if (containerRef.current) {
                setTranslate({ x: containerRef.current.getBoundingClientRect().width / 2, y: 50 });
              }
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ADD NODE MODAL */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-black dark:text-white">
                {selectedNodeId ? `Add to ${selectedNodeName}` : t('create_root')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4">
              {/* Tabs */}
              <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setModalTab('existing')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${modalTab === 'existing' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t('org_tab_existing')}
                </button>
                <button
                  onClick={() => setModalTab('new')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${modalTab === 'new' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t('org_tab_new')}
                </button>
              </div>

              {modalTab === 'existing' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('org_lbl_select_emp')}</label>
                    <select
                      value={selectedEmployeeId}
                      onChange={e => setSelectedEmployeeId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">{t('org_opt_choose')}</option>
                      {employeesList.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.id}) - {emp.position}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-2">
                      {t('org_msg_move_desc')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('lbl_full_name')}</label>
                    <input
                      type="text"
                      value={newEmployeeName}
                      onChange={e => setNewEmployeeName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('lbl_position')}</label>
                    <input
                      type="text"
                      value={newEmployeePosition}
                      onChange={e => setNewEmployeePosition(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('lbl_department')}</label>
                    <input
                      type="text"
                      value={newEmployeeDept}
                      onChange={e => setNewEmployeeDept(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {t('btn_cancel')}
              </button>
              <button
                onClick={handleConfirmAdd}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                {modalTab === 'existing' ? t('org_btn_move') : t('org_btn_create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE DIRECTORY MODAL */}
      {isEmployeeListOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-black dark:text-white">{t('employee_directory')}</h3>
              <button onClick={() => setIsEmployeeListOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('search_employees')}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={employeeListSearch}
                  onChange={e => setEmployeeListSearch(e.target.value)}
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
              </div>
              {!selectedNodeId && (
                <div className="mt-2 text-xs text-blue-500 font-medium">
                  {t('org_hint_click_assign')}
                </div>
              )}
              {selectedNodeId && (
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {t('org_hint_assigning')} <span className="font-bold">{selectedNodeName}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {employeesList
                .filter(emp =>
                  emp.fullName.toLowerCase().includes(employeeListSearch.toLowerCase()) ||
                  emp.id.includes(employeeListSearch) ||
                  emp.position.toLowerCase().includes(employeeListSearch.toLowerCase())
                )
                .map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-sm">
                        {emp.avatarUrl ? <img src={emp.avatarUrl} className="w-full h-full rounded-full object-cover" /> : emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white">{emp.fullName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{emp.position} • {emp.department}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignFromList(emp.id, emp.fullName)}
                      disabled={emp.id === selectedNodeId}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${emp.id === selectedNodeId
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                      {emp.managerId === selectedNodeId ? t('org_status_assigned') : t('org_btn_assign')}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
