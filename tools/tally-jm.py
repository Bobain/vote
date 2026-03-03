#!/usr/bin/env python3
"""
Dépouillement Jugement Majoritaire (Balinski & Laraki, 2007).

Usage :
    python3 tools/tally-jm.py votes.csv

Le CSV doit avoir les colonnes :
    Horodatage, Pseudonyme, Parvis, Chapeau, Troubadour, Kiosque,
    Liesse, Prélude, Saltimbanque, Mélomane, Guinguette, Lyre
"""
import csv
import sys
from collections import Counter

# Mentions ordonnées de la meilleure à la pire
MENTIONS = [
    "Excellent", "Très bien", "Bien", "Assez bien",
    "Passable", "Insuffisant", "À rejeter",
]
MENTION_RANK = {m: i for i, m in enumerate(MENTIONS)}

NAMES = [
    "Parvis", "Chapeau", "Troubadour", "Kiosque", "Liesse",
    "Prélude", "Saltimbanque", "Mélomane", "Guinguette", "Lyre",
]


def median_mention(votes):
    """Mention médiane d'une liste de mentions."""
    ranked = sorted(votes, key=lambda m: MENTION_RANK[m])
    return ranked[len(ranked) // 2]


def jm_sort_key(votes):
    """
    Clé de tri Balinski & Laraki : retrait itératif de la mention médiane.

    Retourne un tuple de rangs de mentions retirées successivement.
    Le candidat avec le tuple le plus petit (lexicographiquement) gagne.
    """
    remaining = list(votes)
    key = []
    while remaining:
        med = median_mention(remaining)
        key.append(MENTION_RANK[med])
        remaining.remove(med)
    return tuple(key)


def main():
    if len(sys.argv) != 2:
        print(f"Usage : python3 {sys.argv[0]} votes.csv")
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print("Aucun vote trouvé.")
        sys.exit(1)

    print(f"{len(rows)} vote(s) enregistré(s)\n")

    # Collecter les votes par candidat
    results = {}
    for name in NAMES:
        votes = []
        for row in rows:
            mention = row.get(name, "").strip()
            if mention in MENTION_RANK:
                votes.append(mention)
        if votes:
            results[name] = votes

    # Trier par clé JM
    ranking = sorted(results.items(), key=lambda item: jm_sort_key(item[1]))

    # Affichage
    print(f"{'Rang':<5} {'Nom':<15} {'Mention majoritaire':<20} {'Détail'}")
    print("-" * 65)
    for i, (name, votes) in enumerate(ranking, 1):
        med = median_mention(votes)
        counts = Counter(votes)
        detail = ", ".join(f"{m}: {counts.get(m, 0)}" for m in MENTIONS if counts.get(m, 0))
        print(f"{i:<5} {name:<15} {med:<20} {detail}")


if __name__ == "__main__":
    main()
