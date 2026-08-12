/**
 * Vehicle image map for showroom.
 * Each key is `${make}|${model}` and value is a direct image URL or
 * a search phrase suitable for a stable Unsplash source URL.
 *
 * Fallback rule: anything not mapped here falls back to category images.
 */

const vehicleImageMap = {
  two_wheeler: {
    'Ola Electric|S1 Air':
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250&fit=crop&auto=format',
    'Ola Electric|S1':
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=250&fit=crop&auto=format',
    'Ola Electric|S1 Pro':
      'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=250&fit=crop&auto=format',
    'Ola Electric|S1 X':
      'https://images.unsplash.com/photo-1607427293702-036933bbf3f0?w=400&h=250&fit=crop&auto=format',
    'Ather Energy|450X':
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop&auto=format',
    'Ather Energy|450 Plus':
      'https://images.unsplash.com/photo-1603416185357-e718e0945754?w=400&h=250&fit=crop&auto=format',
    'Ather Energy|450 Apex':
      'https://images.unsplash.com/photo-1620121478247-ec7867399c68?w=400&h=250&fit=crop&auto=format',
    'Ather Energy|Rizta':
      'https://images.unsplash.com/photo-1619767886558-efdc7b9af5f5?w=400&h=250&fit=crop&auto=format',
    'Bajaj Auto|Chetak Premium':
      'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=250&fit=crop&auto=format',
    'Bajaj Auto|Chetak Urbane':
      'https://images.unsplash.com/photo-1607427293702-036933bbf3f0?w=400&h=250&fit=crop&auto=format',
    'TVS Motor|iQube Electric':
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250&fit=crop&auto=format',
    'TVS Motor|iQube S':
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=250&fit=crop&auto=format',
    'TVS Motor|iQube ST':
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop&auto=format',
    'Simple Energy|One':
      'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=250&fit=crop&auto=format',
    'Ampere|Magnus':
      'https://images.unsplash.com/photo-1607427293702-036933bbf3f0?w=400&h=250&fit=crop&auto=format',
    'Ampere|Reo Plus':
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250&fit=crop&auto=format',
    'Hero Electric|Optima CX':
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=250&fit=crop&auto=format',
    'Hero Electric|Atria':
      'https://images.unsplash.com/photo-1603416185357-e718e0945754?w=400&h=250&fit=crop&auto=format',
    'Okinawa|Praise Pro':
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250&fit=crop&auto=format',
    'Okinawa|iPraise+':
      'https://images.unsplash.com/photo-1607427293702-036933bbf3f0?w=400&h=250&fit=crop&auto=format',
  },
  three_wheeler: {
    'Mahindra Electric|Treo':
      'https://images.unsplash.com/photo-1626149637281-4e227308da18?fm=jpg&q=80&w=400&h=250&fit=crop&auto=format',
    'Mahindra Electric|Treo Zor (Cargo)':
      'https://images.unsplash.com/photo-1639919397870-cc2c183be021?fm=jpg&q=80&w=400&h=250&fit=crop&auto=format',
    'Piaggio|Ape E-City':
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?fm=jpg&q=80&w=400&h=250&fit=crop&auto=format',
    'Piaggio|Ape E-Xtra':
      'https://images.unsplash.com/photo-1626491058156-2daaeea7f578?fm=jpg&q=80&w=400&h=250&fit=crop&auto=format',
    'Bajaj Auto|RE EV':
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?fm=jpg&q=80&w=400&h=250&fit=crop&auto=format',
  },
  four_wheeler: {
    'Tata Motors|Nexon EV Prime':
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Nexon EV Max':
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Nexon EV LR':
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Nexon EV MR':
      'https://images.unsplash.com/photo-1619767886558-efdc7b9af5f5?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Tiago EV':
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Tiago EV LR':
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Punch EV':
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Punch EV LR':
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop&auto=format',
    'Tata Motors|Curvv EV':
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format',
    'MG Motor|ZS EV (Standard)':
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop&auto=format',
    'MG Motor|ZS EV (Long Range)':
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop&auto=format',
    'MG Motor|Comet EV':
      'https://images.unsplash.com/photo-1619767886558-efdc7b9af5f5?w=400&h=250&fit=crop&auto=format',
    'MG Motor|Windsor EV':
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop&auto=format',
    'Hyundai|Kona Electric':
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop&auto=format',
    'Hyundai|IONIQ 5':
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250&fit=crop&auto=format',
    'Hyundai|Creta EV':
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250&fit=crop&auto=format',
    'BYD India|Atto 3 (Standard)':
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format',
    'BYD India|Atto 3 (Extended)':
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop&auto=format',
    'BYD India|e6':
      'https://images.unsplash.com/photo-1619767886558-efdc7b9af5f5?w=400&h=250&fit=crop&auto=format',
    'BYD India|Seal':
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop&auto=format',
    'Mahindra|XUV400 (EC)':
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop&auto=format',
    'Mahindra|XUV400 (EL)':
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop&auto=format',
    'Mahindra|BE 6e':
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250&fit=crop&auto=format',
    'Mahindra|XEV 9e':
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop&auto=format',
    'Citroen|eC3':
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250&fit=crop&auto=format',
    'Volvo|XC40 Recharge':
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format',
    'Volvo|C40 Recharge':
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop&auto=format',
    'BMW|i4 eDrive35':
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop&auto=format',
    'BMW|iX1':
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop&auto=format',
    'BMW|i7':
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250&fit=crop&auto=format',
    'Mercedes-Benz|EQS 580':
      'https://images.unsplash.com/photo-1619767886558-efdc7b9af5f5?w=400&h=250&fit=crop&auto=format',
    'Mercedes-Benz|EQB':
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format',
  },
  bus_heavy: {
    'Olectra Greentech|K9 (12m Bus)':
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250&fit=crop&auto=format',
    'Olectra Greentech|9m Mini Bus':
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop&auto=format',
    'PMI Electro|Fusion (12m Bus)':
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250&fit=crop&auto=format',
    'JBM Auto|9m Mini EV Bus':
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop&auto=format',
    'JBM Auto|12m EV Bus':
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250&fit=crop&auto=format',
    'Ashok Leyland|Switch EiV 12':
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250&fit=crop&auto=format',
    'Ashok Leyland|Switch EiV 9':
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop&auto=format',
  },
};

export function getVehicleImageUrl(categoryId, make, model) {
  const key = `${make}|${model}`;
  const mapped = vehicleImageMap[categoryId]?.[key];
  if (mapped) return mapped;

  const fallbackCategory = {
    two_wheeler: 'two_wheeler',
    three_wheeler: 'three_wheeler',
    four_wheeler: 'four_wheeler',
    bus_heavy: 'bus_heavy',
  }[categoryId] || 'four_wheeler';

  const fallbackImages = {
    two_wheeler: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1607427293702-036933bbf3f0?w=400&h=250&fit=crop&auto=format',
    ],
    three_wheeler: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=250&fit=crop&auto=format',
    ],
    four_wheeler: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1619767886558-efdc7b9af5f5?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop&auto=format',
    ],
    bus_heavy: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop&auto=format',
    ],
  };

  const images = fallbackImages[fallbackCategory] || fallbackImages.four_wheeler;
  const hash = [...(make + model)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return images[hash % images.length];
}

export default vehicleImageMap;