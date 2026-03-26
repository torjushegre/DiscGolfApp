import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
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

function Room() {
  const [bagLidDiscs, setBagLidDiscs] = useState<Disc[]>([]);
  const [bagMainDiscs, setBagMainDiscs] = useState<Disc[]>([]);
  const [shelfSections, setShelfSections] = useState<Disc[][]>([[], []]);
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

      const bag = allDiscs.filter((d) => d.status === 'bag');
      setBagLidDiscs(bag.filter((d) => (d.zone || 0) === 0));
      setBagMainDiscs(bag.filter((d) => (d.zone || 0) === 1));

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
      if (sections[sections.length - 1].length > 0) sections.push([]);
      while (sections.length < MIN_SHELF_SECTIONS) sections.push([]);
      setShelfSections(sections);

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

  const totalLocationDiscs = bagLidDiscs.length + bagMainDiscs.length + shelfSections.flat().length;
  const totalAces = podiumSlots.filter(Boolean).length + restAces.length;

  // ======== LOCATION DRAG (bag/shelf) ========

  const findLocationContainer = (id: string | number): string | null => {
    if (typeof id === 'string') {
      if (['bag-lid', 'bag-main'].includes(id) || id.startsWith('shelf-')) return id;
    }
    const numId = typeof id === 'number' ? id : parseInt(id);
    if (bagLidDiscs.some((d) => d.id === numId)) return 'bag-lid';
    if (bagMainDiscs.some((d) => d.id === numId)) return 'bag-main';
    for (let i = 0; i < shelfSections.length; i++) {
      if (shelfSections[i].some((d) => d.id === numId)) return `shelf-${i}`;
    }
    return null;
  };

  const getLocationDiscs = (cid: string): Disc[] => {
    if (cid === 'bag-lid') return bagLidDiscs;
    if (cid === 'bag-main') return bagMainDiscs;
    if (cid.startsWith('shelf-')) return shelfSections[parseInt(cid.split('-')[1])] || [];
    return [];
  };

  const setLocationDiscs = (cid: string, discs: Disc[]) => {
    if (cid === 'bag-lid') setBagLidDiscs(discs);
    else if (cid === 'bag-main') setBagMainDiscs(discs);
    else if (cid.startsWith('shelf-')) {
      const idx = parseInt(cid.split('-')[1]);
      setShelfSections((prev) => {
        const next = [...prev];
        next[idx] = discs;
        if (idx === next.length - 1 && discs.length > 0) next.push([]);
        return next;
      });
    }
  };

  const handleLocationDragStart = (event: DragStartEvent) => {
    const allLoc = [...bagLidDiscs, ...bagMainDiscs, ...shelfSections.flat()];
    const disc = allLoc.find((d) => d.id === event.active.id);
    setActiveDisc(disc || null);
  };

  const handleLocationDragEnd = async (event: DragEndEvent) => {
    setActiveDisc(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const sourceId = findLocationContainer(activeId);
    if (!sourceId) return;

    // Is overId a container or a disc?
    const isContainer = typeof overId === 'string' && findLocationContainer(overId) === overId;
    const targetId = isContainer ? overId as string : findLocationContainer(overId);
    if (!targetId) return;

    // Same container reorder
    if (sourceId === targetId && !isContainer) {
      const list = getLocationDiscs(sourceId);
      const oldIdx = list.findIndex((d) => d.id === activeId);
      const newIdx = list.findIndex((d) => d.id === (overId as number));
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const newList = arrayMove(list, oldIdx, newIdx);
        setLocationDiscs(sourceId, newList);
        persistLocationContainer(sourceId, newList);
      }
      return;
    }

    // Cross-container move
    if (sourceId !== targetId) {
      const disc = getLocationDiscs(sourceId).find((d) => d.id === activeId);
      if (!disc) return;

      // Remove from source
      const newSource = getLocationDiscs(sourceId).filter((d) => d.id !== activeId);
      setLocationDiscs(sourceId, newSource);

      // Add to target
      const targetList = getLocationDiscs(targetId);
      const overIdx = targetList.findIndex((d) => d.id === (overId as number));
      const insertAt = overIdx >= 0 ? overIdx : targetList.length;
      const newTarget = [...targetList];
      const newStatus: DiscStatus = targetId.startsWith('shelf') ? 'shelf' : 'bag';
      const newZone = targetId === 'bag-lid' ? 0 : targetId === 'bag-main' ? 1 : parseInt(targetId.split('-')[1]);
      newTarget.splice(insertAt, 0, { ...disc, status: newStatus, zone: newZone });
      setLocationDiscs(targetId, newTarget);

      // Persist both
      persistLocationContainer(sourceId, newSource);
      persistLocationContainer(targetId, newTarget);
    }
  };

  const persistLocationContainer = async (cid: string, discs: Disc[]) => {
    const status: DiscStatus = cid.startsWith('shelf') ? 'shelf' : 'bag';
    const zone = cid === 'bag-lid' ? 0 : cid === 'bag-main' ? 1 : parseInt(cid.split('-')[1]);
    await reorderDiscs(discs.map((d, i) => ({ id: d.id, sort_order: i, status, zone })));
  };

  // ======== WALL OF FAME DRAG ========
  // Uses "ace-{id}" prefix to avoid collision with location discs

  const handleWallDragStart = (event: DragStartEvent) => {
    const rawId = String(event.active.id);
    const discId = rawId.startsWith('ace-') ? parseInt(rawId.slice(4)) : parseInt(rawId);
    const allAces = [...podiumSlots.filter(Boolean) as Disc[], ...restAces];
    const disc = allAces.find((d) => d.id === discId);
    setActiveDisc(disc || null);
  };

  const handleWallDragEnd = async (event: DragEndEvent) => {
    setActiveDisc(null);
    const { active, over } = event;
    if (!over) return;

    const activeRaw = String(active.id);
    const overRaw = String(over.id);
    const activeDiscId = activeRaw.startsWith('ace-') ? parseInt(activeRaw.slice(4)) : parseInt(activeRaw);

    // Find where the active disc currently is
    const allAces = [...podiumSlots.filter(Boolean) as Disc[], ...restAces];
    const disc = allAces.find((d) => d.id === activeDiscId);
    if (!disc) return;

    // Determine source
    let sourceType: 'podium' | 'rest' = 'rest';
    let sourceRank = -1;
    for (let i = 0; i < 3; i++) {
      if (podiumSlots[i]?.id === activeDiscId) {
        sourceType = 'podium';
        sourceRank = i;
        break;
      }
    }

    // Determine target
    const isPodiumTarget = overRaw.startsWith('podium-');
    const isRestTarget = overRaw === 'wall-rest';

    if (isPodiumTarget) {
      const targetRank = parseInt(overRaw.split('-')[1]) - 1;

      if (sourceType === 'podium') {
        // Swap podium slots
        setPodiumSlots((prev) => {
          const next = [...prev];
          next[sourceRank] = prev[targetRank];
          next[targetRank] = disc;
          return next;
        });
      } else {
        // Move from rest to podium
        const existingDisc = podiumSlots[targetRank];
        setRestAces((prev) => {
          let next = prev.filter((d) => d.id !== activeDiscId);
          if (existingDisc) next = [...next, existingDisc];
          return next;
        });
        setPodiumSlots((prev) => {
          const next = [...prev];
          next[targetRank] = disc;
          return next;
        });
      }

      // Persist
      await updateDiscFields(disc.id, { ace_rank: targetRank + 1 });
      if (sourceType === 'podium') {
        const swapped = podiumSlots[targetRank];
        if (swapped) await updateDiscFields(swapped.id, { ace_rank: sourceRank + 1 });
        else await updateDiscFields(disc.id, { ace_rank: targetRank + 1 }); // already done above
      }
      return;
    }

    if (isRestTarget || overRaw.startsWith('ace-')) {
      if (sourceType === 'podium') {
        // Move from podium to rest
        setPodiumSlots((prev) => {
          const next = [...prev];
          next[sourceRank] = null;
          return next;
        });
        setRestAces((prev) => [...prev, { ...disc, ace_rank: null }]);
        await updateDiscFields(disc.id, { ace_rank: null });
      } else {
        // Reorder within rest
        const overDiscId = overRaw.startsWith('ace-') ? parseInt(overRaw.slice(4)) : null;
        if (overDiscId) {
          const oldIdx = restAces.findIndex((d) => d.id === activeDiscId);
          const newIdx = restAces.findIndex((d) => d.id === overDiscId);
          if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
            setRestAces(arrayMove(restAces, oldIdx, newIdx));
          }
        }
      }
    }
  };

  // ======== COMMON ========

  const handleDiscUpdate = () => {
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
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        <StatsOverlay
          total={totalLocationDiscs}
          bag={bagLidDiscs.length + bagMainDiscs.length}
          shelf={shelfSections.flat().length}
          aces={totalAces}
        />

        {/* Wall of Fame — its own DndContext */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleWallDragStart}
          onDragEnd={handleWallDragEnd}
        >
          <WallOfFameZone
            podiumSlots={podiumSlots}
            restAces={restAces}
            onDiscClick={setSelectedDisc}
          />
          <DragOverlay>
            {activeDisc && <DraggableDisc disc={activeDisc} isDragging />}
          </DragOverlay>
        </DndContext>

        {/* Bag/Shelf — its own DndContext */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleLocationDragStart}
          onDragEnd={handleLocationDragEnd}
        >
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
          <DragOverlay>
            {activeDisc && <DraggableDisc disc={activeDisc} isDragging />}
          </DragOverlay>
        </DndContext>

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
    </>
  );
}

export default Room;
