import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { getDiscs, getAces, reorderDiscs, updateDiscFields } from '../services/discs';
import type { Disc, DiscStatus } from '../services/discs';
import BagZone from './BagZone';
import ShelfZone from './ShelfZone';
import WallOfFameZone from './WallOfFameZone';
import StatsOverlay from './StatsOverlay';
import DiscDetailModal from './DiscDetailModal';
import DraggableDisc from './DraggableDisc';

const MIN_SHELF_SECTIONS = 2;

// Container types
type ContainerId = string; // bag-lid, bag-main, shelf-0, shelf-1, ..., podium-1, podium-2, podium-3, wall-rest

function parseContainer(id: string | number): { type: 'bag'; zone: number } | { type: 'shelf'; zone: number } | { type: 'podium'; rank: number } | { type: 'wall-rest' } | null {
  if (typeof id !== 'string') return null;
  if (id === 'bag-lid') return { type: 'bag', zone: 0 };
  if (id === 'bag-main') return { type: 'bag', zone: 1 };
  if (id.startsWith('shelf-')) return { type: 'shelf', zone: parseInt(id.split('-')[1]) };
  if (id.startsWith('podium-')) return { type: 'podium', rank: parseInt(id.split('-')[1]) };
  if (id === 'wall-rest') return { type: 'wall-rest' };
  return null;
}

function Room() {
  // Bag: zone 0 = lid, zone 1 = main
  const [bagLidDiscs, setBagLidDiscs] = useState<Disc[]>([]);
  const [bagMainDiscs, setBagMainDiscs] = useState<Disc[]>([]);
  // Shelf: array of sections
  const [shelfSections, setShelfSections] = useState<Disc[][]>([[], []]);
  // Aces
  const [podiumSlots, setPodiumSlots] = useState<(Disc | null)[]>([null, null, null]);
  const [restAces, setRestAces] = useState<Disc[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeDisc, setActiveDisc] = useState<Disc | null>(null);
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchData = useCallback(async () => {
    try {
      const [discsRes, acesRes] = await Promise.all([getDiscs(), getAces()]);
      const allDiscs = discsRes.data || [];
      const aceDiscs = acesRes.data || [];

      // Bag
      const bag = allDiscs.filter((d) => d.status === 'bag');
      setBagLidDiscs(bag.filter((d) => (d.zone || 0) === 0));
      setBagMainDiscs(bag.filter((d) => (d.zone || 0) === 1));

      // Shelf - group by zone
      const shelf = allDiscs.filter((d) => d.status === 'shelf');
      const zoneMap = new Map<number, Disc[]>();
      shelf.forEach((d) => {
        const z = d.zone || 0;
        if (!zoneMap.has(z)) zoneMap.set(z, []);
        zoneMap.get(z)!.push(d);
      });
      const maxZone = Math.max(...Array.from(zoneMap.keys()), MIN_SHELF_SECTIONS - 1);
      const sections: Disc[][] = [];
      for (let i = 0; i <= maxZone; i++) {
        sections.push(zoneMap.get(i) || []);
      }
      // Add extra empty section if last section has discs
      if (sections[sections.length - 1].length > 0) {
        sections.push([]);
      }
      while (sections.length < MIN_SHELF_SECTIONS) {
        sections.push([]);
      }
      setShelfSections(sections);

      // Aces - podium slots
      const newPodium: (Disc | null)[] = [null, null, null];
      const rest: Disc[] = [];
      aceDiscs.forEach((d) => {
        if (d.ace_rank === 1) newPodium[0] = d;
        else if (d.ace_rank === 2) newPodium[1] = d;
        else if (d.ace_rank === 3) newPodium[2] = d;
        else rest.push(d);
      });
      setPodiumSlots(newPodium);
      setRestAces(rest);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // All discs flat list for lookups
  const allDiscs = useMemo(() => [
    ...bagLidDiscs, ...bagMainDiscs,
    ...shelfSections.flat(),
    ...podiumSlots.filter(Boolean) as Disc[],
    ...restAces,
  ], [bagLidDiscs, bagMainDiscs, shelfSections, podiumSlots, restAces]);

  const totalLocationDiscs = bagLidDiscs.length + bagMainDiscs.length + shelfSections.flat().length;
  const totalAces = podiumSlots.filter(Boolean).length + restAces.length;

  // Find which container a disc is in
  const findContainer = (discId: number | string): ContainerId | null => {
    if (bagLidDiscs.some((d) => d.id === discId)) return 'bag-lid';
    if (bagMainDiscs.some((d) => d.id === discId)) return 'bag-main';
    for (let i = 0; i < shelfSections.length; i++) {
      if (shelfSections[i].some((d) => d.id === discId)) return `shelf-${i}`;
    }
    for (let i = 0; i < 3; i++) {
      if (podiumSlots[i]?.id === discId) return `podium-${i + 1}`;
    }
    if (restAces.some((d) => d.id === discId)) return 'wall-rest';
    return null;
  };

  const getContainerDiscs = (containerId: ContainerId): Disc[] => {
    if (containerId === 'bag-lid') return bagLidDiscs;
    if (containerId === 'bag-main') return bagMainDiscs;
    if (containerId.startsWith('shelf-')) return shelfSections[parseInt(containerId.split('-')[1])] || [];
    if (containerId.startsWith('podium-')) {
      const d = podiumSlots[parseInt(containerId.split('-')[1]) - 1];
      return d ? [d] : [];
    }
    if (containerId === 'wall-rest') return restAces;
    return [];
  };

  const setContainerDiscs = (containerId: ContainerId, discs: Disc[]) => {
    if (containerId === 'bag-lid') setBagLidDiscs(discs);
    else if (containerId === 'bag-main') setBagMainDiscs(discs);
    else if (containerId.startsWith('shelf-')) {
      const idx = parseInt(containerId.split('-')[1]);
      setShelfSections((prev) => {
        const next = [...prev];
        next[idx] = discs;
        // Add new section if last one now has discs
        if (idx === next.length - 1 && discs.length > 0) next.push([]);
        return next;
      });
    } else if (containerId.startsWith('podium-')) {
      const rank = parseInt(containerId.split('-')[1]) - 1;
      setPodiumSlots((prev) => {
        const next = [...prev];
        next[rank] = discs[0] || null;
        return next;
      });
    } else if (containerId === 'wall-rest') {
      setRestAces(discs);
    }
  };

  const removeFromContainer = (containerId: ContainerId, discId: number) => {
    const discs = getContainerDiscs(containerId).filter((d) => d.id !== discId);
    setContainerDiscs(containerId, discs);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const disc = allDiscs.find((d) => d.id === event.active.id);
    setActiveDisc(disc || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const sourceContainer = findContainer(activeId);
    if (!sourceContainer) return;

    // Determine target container: either overId IS a container, or it's a disc inside one
    const parsedOver = parseContainer(overId);
    const targetContainer: ContainerId | null = parsedOver ? String(overId) : findContainer(overId as number);
    if (!targetContainer) return;

    if (sourceContainer === targetContainer) return;

    const sourceParsed = parseContainer(sourceContainer);
    const targetParsed = parseContainer(targetContainer);
    if (!sourceParsed || !targetParsed) return;

    const disc = allDiscs.find((d) => d.id === activeId);
    if (!disc) return;

    // Don't allow non-ace discs onto podium/wall-rest
    if ((targetParsed.type === 'podium' || targetParsed.type === 'wall-rest') && !disc.is_ace) return;

    // Only allow: location<->location, wall<->wall
    const sourceIsWall = sourceParsed.type === 'podium' || sourceParsed.type === 'wall-rest';
    const targetIsLocation = targetParsed.type === 'bag' || targetParsed.type === 'shelf';
    const sourceIsLocation = sourceParsed.type === 'bag' || sourceParsed.type === 'shelf';
    const targetIsWall = targetParsed.type === 'podium' || targetParsed.type === 'wall-rest';
    if (sourceIsWall && targetIsLocation) return;
    if (sourceIsLocation && targetIsWall) return;

    // Handle podium slot (max 1 disc) — swap if occupied
    if (targetParsed.type === 'podium') {
      const existingDisc = podiumSlots[targetParsed.rank - 1];
      removeFromContainer(sourceContainer, activeId);
      if (existingDisc) {
        if (sourceParsed.type === 'podium') {
          setPodiumSlots((prev) => {
            const next = [...prev];
            next[sourceParsed.rank - 1] = existingDisc;
            next[targetParsed.rank - 1] = { ...disc, ace_rank: targetParsed.rank };
            return next;
          });
          return;
        } else {
          setRestAces((prev) => [...prev, { ...existingDisc, ace_rank: null }]);
        }
      }
      setPodiumSlots((prev) => {
        const next = [...prev];
        next[targetParsed.rank - 1] = { ...disc, ace_rank: targetParsed.rank };
        return next;
      });
      return;
    }

    // Handle wall-rest target
    if (targetParsed.type === 'wall-rest') {
      removeFromContainer(sourceContainer, activeId);
      setRestAces((prev) => [...prev, { ...disc, ace_rank: null }]);
      return;
    }

    // Location moves (bag/shelf)
    removeFromContainer(sourceContainer, activeId);
    const newStatus: DiscStatus = targetParsed.type === 'bag' ? 'bag' : 'shelf';
    const targetDiscs = getContainerDiscs(targetContainer);
    const overIndex = targetDiscs.findIndex((d) => d.id === (overId as number));
    const insertAt = overIndex >= 0 ? overIndex : targetDiscs.length;
    const newDiscs = [...targetDiscs];
    newDiscs.splice(insertAt, 0, { ...disc, status: newStatus, zone: targetParsed.zone ?? 0 });
    setContainerDiscs(targetContainer, newDiscs);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDisc(null);
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    if (!activeContainer) return;

    const isZoneDrop = !!parseContainer(overId);
    const overContainer = isZoneDrop ? String(overId) : findContainer(overId as number);
    if (!overContainer) return;

    // Reorder within same container
    if (activeContainer === overContainer && !isZoneDrop) {
      const currentDiscs = getContainerDiscs(activeContainer);
      const oldIndex = currentDiscs.findIndex((d) => d.id === activeId);
      const newIndex = currentDiscs.findIndex((d) => d.id === (overId as number));

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newList = arrayMove(currentDiscs, oldIndex, newIndex);
        setContainerDiscs(activeContainer, newList);
        // Persist order for location containers
        const parsed = parseContainer(activeContainer);
        if (parsed && (parsed.type === 'bag' || parsed.type === 'shelf')) {
          persistContainerOrder(activeContainer, newList);
        }
      }
      return;
    }

    // Cross-container already handled in dragOver — just persist
    persistAll();
  };

  const persistContainerOrder = async (containerId: ContainerId, discs: Disc[]) => {
    const parsed = parseContainer(containerId);
    if (!parsed) return;
    if (parsed.type === 'bag') {
      await reorderDiscs(discs.map((d, i) => ({ id: d.id, sort_order: i, status: 'bag' as DiscStatus, zone: parsed.zone })));
    } else if (parsed.type === 'shelf') {
      await reorderDiscs(discs.map((d, i) => ({ id: d.id, sort_order: i, status: 'shelf' as DiscStatus, zone: parsed.zone })));
    }
  };

  const persistAll = async () => {
    const updates: Promise<unknown>[] = [];

    // Bag
    updates.push(reorderDiscs(bagLidDiscs.map((d, i) => ({ id: d.id, sort_order: i, status: 'bag' as DiscStatus, zone: 0 }))));
    updates.push(reorderDiscs(bagMainDiscs.map((d, i) => ({ id: d.id, sort_order: i, status: 'bag' as DiscStatus, zone: 1 }))));

    // Shelf
    shelfSections.forEach((section, zoneIdx) => {
      if (section.length > 0) {
        updates.push(reorderDiscs(section.map((d, i) => ({ id: d.id, sort_order: i, status: 'shelf' as DiscStatus, zone: zoneIdx }))));
      }
    });

    // Podium
    podiumSlots.forEach((disc, i) => {
      if (disc) {
        updates.push(updateDiscFields(disc.id, { ace_rank: i + 1 }));
      }
    });

    // Rest aces - clear rank
    restAces.forEach((disc) => {
      updates.push(updateDiscFields(disc.id, { ace_rank: null }));
    });

    await Promise.all(updates);
  };

  const handleDiscUpdate = (_updatedDisc: Disc) => {
    // Refresh everything to keep state consistent
    fetchData();
  };

  const handleDiscDelete = (discId: number) => {
    setBagLidDiscs((prev) => prev.filter((d) => d.id !== discId));
    setBagMainDiscs((prev) => prev.filter((d) => d.id !== discId));
    setShelfSections((prev) => prev.map((s) => s.filter((d) => d.id !== discId)));
    setPodiumSlots((prev) => prev.map((d) => (d?.id === discId ? null : d)));
    setRestAces((prev) => prev.filter((d) => d.id !== discId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <p className="mt-4 text-gray-400">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <StatsOverlay
          total={totalLocationDiscs}
          bag={bagLidDiscs.length + bagMainDiscs.length}
          shelf={shelfSections.flat().length}
          aces={totalAces}
        />

        <WallOfFameZone
          podiumSlots={podiumSlots}
          restAces={restAces}
          onDiscClick={setSelectedDisc}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BagZone
            lidDiscs={bagLidDiscs}
            mainDiscs={bagMainDiscs}
            onDiscClick={setSelectedDisc}
          />
          <ShelfZone
            sections={shelfSections}
            onDiscClick={setSelectedDisc}
          />
        </div>

        <div className="flex justify-center gap-4 pt-2 pb-4">
          <Link
            to="/add-disc"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg"
          >
            + Legg til disc
          </Link>
          <Link
            to="/all-discs"
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition-colors shadow-lg"
          >
            Alle discer
          </Link>
        </div>
      </div>

      <DragOverlay>
        {activeDisc && <DraggableDisc disc={activeDisc} isDragging />}
      </DragOverlay>

      <AnimatePresence>
        {selectedDisc && (
          <DiscDetailModal
            disc={selectedDisc}
            isOpen={true}
            onClose={() => setSelectedDisc(null)}
            onUpdate={handleDiscUpdate}
            onDelete={handleDiscDelete}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}

export default Room;
