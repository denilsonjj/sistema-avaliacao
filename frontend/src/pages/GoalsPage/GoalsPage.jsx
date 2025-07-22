import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './GoalsPage.module.css';

// --- COMPONENTES INTERNOS ---

function TaskCard({ goal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.goalCard}
    >
      <p>{goal.title}</p>
      <small>Criado por: {goal.author.name}</small>
    </div>
  );
}

function Column({ id, title, goals }) {
  const { setNodeRef } = useDroppable({ id }); // 🔴 Torna a coluna "droppable"

  return (
    <div ref={setNodeRef} className={styles.column}>
      <h2>{title}</h2>
      <SortableContext items={goals.map((g) => g.id)}>
        <div className={styles.cardList}>
          {goals.map((goal) => (
            <TaskCard key={goal.id} goal={goal} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---

function GoalsPage() {
  const { user } = useAuth();
  const [columns, setColumns] = useState({
    PENDENTE: [],
    EM_ANDAMENTO: [],
    CONCLUIDA: [],
  });
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeGoal, setActiveGoal] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/goals/user/${user.userId}`);
      setColumns({
        PENDENTE: res.data.filter((g) => g.status === 'PENDENTE'),
        EM_ANDAMENTO: res.data.filter((g) => g.status === 'EM_ANDAMENTO'),
        CONCLUIDA: res.data.filter((g) => g.status === 'CONCLUIDA'),
      });
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post('/goals', { userId: user.userId, title });
    setTitle('');
    fetchGoals();
  };

  const findContainer = (id) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) =>
      columns[key].some((item) => item.id === id)
    );
  };

  const onDragStart = (event) => {
    const allGoals = Object.values(columns).flat();
    setActiveGoal(allGoals.find((g) => g.id === event.active.id));
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveGoal(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const activeIndex = columns[activeContainer].findIndex(
        (item) => item.id === activeId
      );
      const overIndex = columns[overContainer].findIndex(
        (item) => item.id === overId
      );

      if (activeIndex !== overIndex) {
        setColumns((prev) => ({
          ...prev,
          [overContainer]: arrayMove(
            prev[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    } else {
      const newStatus = overContainer;

      api.put(`/goals/${activeId}/status`, { status: newStatus });

      setColumns((prev) => {
        const activeItems = [...prev[activeContainer]];
        const overItems = [...prev[overContainer]];
        const activeIndex = activeItems.findIndex(
          (item) => item.id === activeId
        );

        const [movedItem] = activeItems.splice(activeIndex, 1);
        movedItem.status = newStatus;

        const overIndex = overItems.findIndex(
          (item) => item.id === overId
        );

        if (overIndex === -1) {
          overItems.push(movedItem);
        } else {
          overItems.splice(overIndex, 0, movedItem);
        }

        return {
          ...prev,
          [activeContainer]: activeItems,
          [overContainer]: overItems,
        };
      });
    }
  };

  const columnTitles = {
    PENDENTE: '📋 A Fazer',
    EM_ANDAMENTO: '⏳ Em Andamento',
    CONCLUIDA: '✔️ Concluído',
  };

  if (loading) return <p>Carregando metas...</p>;

  return (
    <div>
      <h1>Plano de Desenvolvimento</h1>

      <div className={styles.formCard}>
        <form onSubmit={handleCreateGoal}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Adicionar uma nova meta..."
          />
          <button type="submit">+ Adicionar Meta</button>
        </form>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={Object.keys(columns)}>
          <div className={styles.board}>
            {Object.entries(columnTitles).map(([status, title]) => (
              <Column
                key={status}
                id={status}
                title={title}
                goals={columns[status]}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeGoal ? <TaskCard goal={activeGoal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default GoalsPage;
